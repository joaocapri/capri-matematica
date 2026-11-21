/* Servidor do MAT com JOÃO!
   O site continua estático (os arquivos são servidos direto pelo Cloudflare). Este Worker só responde em /api/:
   - /api/saude                      → "ok" (para conferir que a publicação subiu)
   - /api/sala/<CÓDIGO>/ws           → WebSocket da aula ao vivo (modo aula do professor + alunos em /ao-vivo/)
   Cada sala é um Durable Object, que repassa em tempo real o que o professor e os alunos escrevem. */

const CODIGO = /^[A-Z0-9]{4,6}$/;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/saude') return new Response('ok', { headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });
    const m = url.pathname.match(/^\/api\/sala\/([^/]+)\/ws$/);
    if (m) {
      const codigo = m[1].toUpperCase();
      if (!CODIGO.test(codigo)) return new Response('código inválido', { status: 400 });
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('use WebSocket', { status: 426 });
      return env.SALAS.get(env.SALAS.idFromName(codigo)).fetch(req);
    }
    if (url.pathname.startsWith('/api/')) return new Response('não encontrado', { status: 404 });
    return env.ASSETS.fetch(req);
  },
};

const LIMITE = 900 * 1024; // mensagens maiores que isso não passam (o Cloudflare aceita até 1 MiB)

export class Sala {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.token = null;         // segredo do professor que abriu a sala
    this.carregado = false;
    this.prof = null;          // WebSocket do professor
    this.modo = 'aula';        // 'aula' (alunos acompanham a página do professor) | 'exercicio'
    this.pagina = null;        // página atual do professor
    this.exercicio = null;     // página proposta (cada aluno resolve na sua cópia)
    this.alunos = new Map();   // id → { nome, ws, camadas: Map(pid → traços) }  (o que o aluno escreve em cada página)
    this.chave = null;         // segredo do QR Code: sem ele, ninguém entra
    this.admitidos = new Set(); // alunos que já entraram (voltam mesmo depois de o professor gerar um QR novo)
  }

  async carregar() {
    if (this.carregado) return;
    this.token = (await this.ctx.storage.get('token')) || null;
    this.chave = (await this.ctx.storage.get('chave')) || null;
    this.admitidos = new Set((await this.ctx.storage.get('admitidos')) || []);
    this.carregado = true;
  }

  async fetch(req) {
    await this.carregar();
    const par = new WebSocketPair(), [cliente, servidor] = Object.values(par);
    servidor.accept();
    let quem = null; // { papel: 'prof' } | { papel: 'aluno', id }
    servidor.addEventListener('message', async (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      try {
        if (!quem) { quem = await this.ola(servidor, msg); return; }
        if (quem.papel === 'prof') this.doProf(msg, ev.data);
        else this.doAluno(quem.id, msg, ev.data);
      } catch (e) { this.enviar(servidor, { t: 'erro', msg: 'Erro na sala: ' + e.message }); }
    });
    const fim = () => {
      if (!quem) return;
      if (quem.papel === 'prof' && this.prof === servidor) { this.prof = null; this.paraAlunos({ t: 'prof', online: false }); }
      if (quem.papel === 'aluno') { const a = this.alunos.get(quem.id); if (a?.ws === servidor) { a.ws = null; this.listaParaProf(); } }
    };
    servidor.addEventListener('close', fim);
    servidor.addEventListener('error', fim);
    return new Response(null, { status: 101, webSocket: cliente });
  }

  async ola(ws, msg) {
    if (msg.t !== 'ola') { ws.close(1008, 'sem apresentação'); return null; }
    if (msg.papel === 'prof') {
      const tk = String(msg.token || '');
      if (tk.length < 16) { this.enviar(ws, { t: 'erro', msg: 'Token inválido' }); ws.close(1008, 'token'); return null; }
      if (!this.token) { this.token = tk; await this.ctx.storage.put('token', tk); }
      if (msg.chave && String(msg.chave) !== this.chave) { this.chave = String(msg.chave).slice(0, 40); await this.ctx.storage.put('chave', this.chave); }
      else if (this.token !== tk) { this.enviar(ws, { t: 'erro', fatal: true, msg: 'Este código já está em uso por outra sala. Abra uma sala nova.' }); ws.close(1008, 'ocupada'); return null; }
      if (this.prof && this.prof !== ws) { try { this.prof.close(4000, 'aberta em outro aparelho'); } catch {} }
      this.prof = ws;
      this.enviar(ws, { t: 'bemvindo', papel: 'prof' });
      this.listaParaProf();
      for (const [id, a] of this.alunos) for (const [pid, tracos] of a.camadas) this.enviar(ws, { t: 'aluno', id, op: { t: 'pagina', pid, pagina: { tracos } } });
      this.paraAlunos({ t: 'prof', online: true });
      return { papel: 'prof' };
    }
    if (msg.papel === 'aluno') {
      const id = String(msg.id || '').slice(0, 40), nome = String(msg.nome || 'Aluno').trim().slice(0, 40) || 'Aluno';
      const pode = this.token && this.chave && id && (String(msg.chave || '') === this.chave || this.admitidos.has(id));
      if (!pode) { this.enviar(ws, { t: 'erro', fatal: true, msg: 'Este link de entrada não vale mais. Peça ao professor o QR Code da aula.' }); ws.close(1008, 'sem acesso'); return null; }
      if (!this.admitidos.has(id)) { this.admitidos.add(id); await this.ctx.storage.put('admitidos', [...this.admitidos].slice(-200)); }
      let a = this.alunos.get(id);
      if (!a) { a = { nome, ws: null, camadas: new Map() }; this.alunos.set(id, a); }
      if (a.ws && a.ws !== ws) { try { a.ws.close(4000, 'aberta em outro aparelho'); } catch {} }
      a.ws = ws; a.nome = nome;
      this.enviar(ws, { t: 'estado', modo: this.modo, pagina: this.pagina, exercicio: this.exercicio, profOnline: !!this.prof });
      this.listaParaProf();
      return { papel: 'aluno', id };
    }
    ws.close(1008, 'papel'); return null;
  }

  doProf(msg, cru) {
    switch (msg.t) {
      case 'pagina': this.pagina = msg.pagina || null; break;
      case 'add': if (this.pagina && msg.traco) this.pagina.tracos.push(msg.traco); break;
      case 'vivo': case 'laser': break; // só repassa
      case 'chave': // o professor gerou um QR Code novo: os links antigos param de valer para quem ainda não entrou
        this.chave = String(msg.chave || '').slice(0, 40) || null; this.ctx.storage.put('chave', this.chave); return;
      case 'exercicio':
        this.exercicio = msg.pagina || null; this.modo = this.exercicio ? 'exercicio' : 'aula';
        this.paraAlunos({ t: 'estado', modo: this.modo, pagina: this.pagina, exercicio: this.exercicio, profOnline: true });
        return;
      case 'encerrar':
        this.paraAlunos({ t: 'encerrada' });
        for (const a of this.alunos.values()) try { a.ws?.close(1000, 'encerrada'); } catch {}
        this.alunos.clear(); this.pagina = this.exercicio = null; this.modo = 'aula'; this.token = this.chave = null; this.admitidos.clear();
        this.ctx.storage.deleteAll();
        try { this.prof?.close(1000, 'encerrada'); } catch {}
        this.prof = null;
        return;
      default: return;
    }
    if (this.modo === 'aula' && cru.length <= LIMITE) this.paraAlunos(null, cru);
  }

  doAluno(id, msg, cru) { // anotações do aluno: cada página (pid) tem a sua camada, só dele e do professor
    const a = this.alunos.get(id); if (!a) return;
    const pid = String(msg.pid || '').slice(0, 60); if (!pid) return;
    if (msg.t === 'pagina') a.camadas.set(pid, msg.pagina?.tracos || []);
    else if (msg.t === 'add') { if (!a.camadas.has(pid)) a.camadas.set(pid, []); a.camadas.get(pid).push(msg.traco); }
    else if (msg.t !== 'vivo') return;
    if (a.camadas.size > 300) a.camadas.delete(a.camadas.keys().next().value);
    if (this.prof && cru.length <= LIMITE) this.enviar(this.prof, { t: 'aluno', id, op: msg });
  }

  listaParaProf() {
    if (!this.prof) return;
    this.enviar(this.prof, { t: 'alunos', lista: [...this.alunos].map(([id, a]) => ({ id, nome: a.nome, online: !!a.ws })) });
  }
  paraAlunos(msg, cru) {
    const txt = cru || JSON.stringify(msg);
    for (const a of this.alunos.values()) if (a.ws) try { a.ws.send(txt); } catch {}
  }
  enviar(ws, msg) { try { ws.send(JSON.stringify(msg)); } catch {} }
}
