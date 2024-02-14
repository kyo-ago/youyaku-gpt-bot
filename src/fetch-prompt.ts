import { SlackEventAttachments } from "./@types/type";

export const fetchPrompt = (
  channelId: string,
  attachment: SlackEventAttachments,
  botAuthToken: string,
) => {
  const response = UrlFetchApp.fetch(
    `https://slack.com/api/conversations.info?channel=${channelId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + botAuthToken,
      },
    },
  );
  const contentText = response.getContentText();
  const responseJson = JSON.parse(contentText);
  if (responseJson.ok) {
    const prompt =
      responseJson.channel.purpose.value
        .match(/```prompt[\s\S]+?(?:```|$)/)
        ?.pop() || `以下の内容を要約をしてください。`;
    if (attachment["text"]) {
      return `${prompt}\nただし、次の内容は含める必要がありません\n###\n${attachment["text"]}`;
    }
    return prompt;
  } else {
    throw new Error(`Failed to fetch conversations info\n${contentText}`);
  }
};
