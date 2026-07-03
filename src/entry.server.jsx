import { ServerRouter } from "react-router";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext
) {
  let status = responseStatusCode;

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error) {
        status = 500;
        console.error(error);
      },
    }
  );

  await body.allReady;

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status,
  });
}
