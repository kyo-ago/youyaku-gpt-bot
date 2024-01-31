export const fetchPrompt = (channelId: string, botAuthToken: string) => {
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
    return (
      responseJson.channel.purpose.value
        .match(/```prompt[\s\S]+?(?:```|$)/)
        ?.pop() || ""
    );
  } else {
    throw new Error(`Failed to fetch conversations info\n${contentText}`);
  }
};
