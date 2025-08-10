async function runMiddleware(middleware, ctx, command, final) {
  let i = -1;
  async function dispatch(nextCmd) {
    i++;
    if (i === middleware.length) return final(nextCmd);
    const mw = middleware[i];
    return mw(ctx, nextCmd, dispatch);
  }
  return dispatch(command);
}

class CommandBus {
  constructor() {
    this.handlers = new Map();
    this.middleware = [];
  }

  register(type, handler) {
    this.handlers.set(type, handler);
  }

  use(fn) {
    this.middleware.push(fn);
  }

  async exec(ctx, command) {
    const final = async (cmd) => {
      const h = this.handlers.get(cmd.type);
      if (!h) throw new Error(`No handler for ${cmd.type}`);
      return await h(ctx, cmd);
    };
    try {
      return await runMiddleware(this.middleware, ctx, command, final);
    } catch (error) {
      ctx.emitter.emit("command:error", { command, error });
      ctx.dispatch({ type: "ADD_ERROR", error: error.message });
      throw error;
    }
  }
}

export default CommandBus;
