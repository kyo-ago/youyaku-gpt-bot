import { ExtractContent } from "./extract-content";
import { Tiktoken } from "js-tiktoken/lite";
import { cl100k_base_default } from "./tiktoken/cl100k_base";

const gptModel = "gpt-3.5-turbo";

const TOKEN_LIMIT = 4000;

const getRequestMessage = (prompt: string, title: string, body: string) => [
  { role: "system", content: "You are a helpful assistant." },
  { role: "assistant", content: `【Title】${title}\n###\n${body}` },
  {
    role: "user",
    content: `${prompt}\nlang:ja`,
  },
];

const truncateMessage = (prompt: string, title: string, body: string) => {
  const enc = new Tiktoken(cl100k_base_default);
  let count = 50;
  while (count--) {
    const tokens = enc.encode(
      getRequestMessage(prompt, title, body)
        .map((message) => message.content)
        .join(""),
    );
    const tokensCount = tokens.length;
    if (tokensCount <= TOKEN_LIMIT) {
      return body;
    }
    body = body.slice(0, -(body.length / 2));
  }
  return body;
};

const tryCache = <TryResult>(
  tryCall: () => TryResult,
): [null, TryResult] | [Error, null] => {
  try {
    const result = tryCall();
    return [null, result];
  } catch (e: any) {
    return [e, null];
  }
};

export const fetchAIAnswer = (
  link: string,
  prompt: string,
  openaiSecretKey: string,
) => {
  const [error, result] = tryCache(() => UrlFetchApp.fetch(link));
  if (error) {
    return `URLの参照に失敗しました: "${error.message}"`;
  }
  const html = result.getContentText();
  const content = new ExtractContent()
    .analyse(html, {
      threshold: 50,
    })
    .asText();

  const body = truncateMessage(prompt, content.title, content.body);
  const option = {
    method: "post",
    headers: {
      Authorization: "Bearer " + openaiSecretKey,
      Accept: "application/json",
    },
    contentType: "application/json",
    payload: JSON.stringify({
      model: gptModel,
      messages: getRequestMessage(prompt, content.title, body),
      temperature: 0.0,
    }),
  } as const;
  const [apiError, apiResult] = tryCache(() =>
    UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", option),
  );
  if (apiError) {
    return `APIリクエストに失敗しました: ${apiError.message}`;
  }
  const payload = JSON.parse(apiResult.getContentText());
  if (payload.choices.length === 0) return "AIからの応答が空でした";
  const answer = payload.choices[0].message.content;
  return answer.replace(/^\n+/, "");
};
