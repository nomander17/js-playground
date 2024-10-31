import { Application, Router } from "@oak/oak";
import Sandbox from "npm:sandbox";

const router = new Router();

router.get("/", async (ctx) => {
  try {
    const file = await Deno.readFile("index.html");
    ctx.response.headers.set("Content-Type", "text/html");
    ctx.response.body = file;
  } catch (error) {
    console.error(error);
    return new Response("Index not found??", { status: 404 });
  }
});

router.post("/run", async (ctx) => {
  const sandbox = new Sandbox();
  try {
    const body = await ctx.request.body.json();
    console.log(JSON.stringify(body, null, 2));
    const output: { result: string; console: [] } = await new Promise(
      (resolve, reject) => {
        sandbox.run(body.code, (output: { result: string; console: [] }) => {
          if (output) {
            resolve(output);
          } else {
            reject("Error executing code");
          }
        });
      }
    );
    ctx.response.body = { result: output.result, console: output.console };
  } catch (error) {
    console.error(error);
    return new Response("Bad request", { status: 400 });
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 5001 });
console.log("App running on http://localhost:5001.");
