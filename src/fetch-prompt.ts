export const fetchPrompt = (channelId: string, botAuthToken: string) => {
  const response = UrlFetchApp.fetch(
    `https://slack.com/api/conversations.info?token=${botAuthToken}&channel=${channelId}`,
  );
  const responseJson = JSON.parse(response.getContentText());
  if (responseJson.ok) {
    return (
      responseJson.purpose?.value?.match(/```prompt[\s\S]+?(?:```|$)/)?.pop() ||
      ""
    );
  } else {
    throw new Error("Failed to fetch conversations info");
  }
};
