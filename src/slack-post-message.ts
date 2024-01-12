export const slackPostMessage = (
  channelId: string,
  message: string,
  botAuthToken: string,
) => {
  UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + botAuthToken,
    },
    payload: JSON.stringify({
      channel: channelId,
      text: message,
    }),
  });
};
