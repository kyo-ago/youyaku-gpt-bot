import { SlackEventType, SlackMessageType } from "./@types/type";

const isCachedId = (id: string) => {
  const cache = CacheService.getScriptCache();
  const isCached = cache.get(id);
  if (isCached) return true;
  cache.put(id, "cached", 60 * 5);
  return false;
};

const isTargetUrl = (url: string) => {
  if (url.match(/https:\/\/\w+\.slack\.com\/archives\/\w/)) {
    return false;
  }
  return true;
};

export const checkTargetMessage = <R>(
  message: SlackMessageType,
  botMemberId: string,
  matcher: {
    target: (event: SlackEventType, link: string) => R;
    // challenge call from Slack
    challenge: (challenge: string) => R;
    other: () => R;
  },
): R => {
  if (message.type == "url_verification") {
    return matcher.challenge(message.challenge);
  }

  if (message.type !== "event_callback" || message.event.type !== "message") {
    return matcher.other();
  }

  // message modified or deleted
  if (message.event.subtype !== undefined) {
    return matcher.other();
  }

  // from bot message
  if (message.event.user === botMemberId) {
    return matcher.other();
  }

  if (isCachedId(message.event.client_msg_id)) {
    return matcher.other();
  }

  const links = message.event.text
    .replace(/\s/g, "")
    .match(/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/);
  if (!links) {
    return matcher.other();
  }

  const link = links.shift() || "";
  if (!isTargetUrl(link)) {
    return matcher.other();
  }
  return matcher.target(message.event, link);
};
