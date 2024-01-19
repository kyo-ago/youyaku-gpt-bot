import "fast-text-encoding";
import { fetchAIAnswer } from "./fetch-ai-answer";
import { checkTargetMessage } from "./check-target-message";
import { SlackEventType, SlackMessageType } from "./@types/type";
import { slackPostMessage } from "./slack-post-message";
import { fetchPrompt } from "./fetch-prompt";

const BOT_MEMBER_ID =
  PropertiesService.getScriptProperties().getProperty("BOT_MEMBER_ID")!;
const BOT_AUTH_TOKEN =
  PropertiesService.getScriptProperties().getProperty("BOT_AUTH_TOKEN")!;
const OPENAI_SECRET_KEY =
  PropertiesService.getScriptProperties().getProperty("OPENAI_SECRET_KEY")!;

const getResultMessage = (e: GoogleAppsScript.Events.DoPost) => {
  const message = JSON.parse(e.postData.contents) as SlackMessageType;
  return checkTargetMessage(message, BOT_MEMBER_ID, {
    target: (event: SlackEventType, link: string) => {
      const prompt = fetchPrompt(event.channel, BOT_AUTH_TOKEN);
      const answer = fetchAIAnswer(link, prompt, OPENAI_SECRET_KEY);
      slackPostMessage(event.channel, answer, BOT_AUTH_TOKEN);
      return "OK";
    },
    // challenge call from Slack
    challenge: (challenge: string) => challenge,
    other: () => "OK",
  });
};

function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    const result = getResultMessage(e);
    return ContentService.createTextOutput(result || "missing result");
  } catch (e: any) {
    return ContentService.createTextOutput(`Error: "${e.message}"`);
  }
}

function doPostTest() {
  const param = {
    parameter: {},
    contextPath: "",
    contentLength: 0,
    queryString: "",
    parameters: {},
    postData: {
      contents: `{"type":"url_verification","challenge":"response","event":{"type":"message","user":"1","client_msg_id":"1","channel":"1","ts":"1","text":"https://example.com/"}}`,
      length: 0,
      type: "text/plain",
      name: "postData",
    },
    pathInfo: "",
  };
  const result = getResultMessage(param);
  console.log(result);
}
(global as any).doPost = doPost;
(global as any).doPostTest = doPostTest;
