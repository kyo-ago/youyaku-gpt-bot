import {
  SlackEventAttachments,
  SlackEventType,
  SlackMessageType,
} from "./@types/type";

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
    target: (
      channelId: string,
      link: string,
      attachment: SlackEventAttachments,
    ) => R;
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

  if (message.event.subtype !== "message_changed") {
    return matcher.other();
  }

  if (!message.event.message) {
    return matcher.other();
  }

  // from bot message
  if (message.event.message.user === botMemberId) {
    return matcher.other();
  }

  if (
    message.event.message.client_msg_id &&
    isCachedId(message.event.message.client_msg_id)
  ) {
    return matcher.other();
  }

  if (message.event.message.blocks.length !== 1) {
    return matcher.other();
  }
  const block = message.event.message.blocks[0];
  if (
    block?.elements.length !== 1 &&
    block?.elements[0].type !== "rich_text_section"
  ) {
    return matcher.other();
  }
  const section = block.elements[0];
  if (section?.elements.length !== 1 && section?.elements[0].type !== "link") {
    return matcher.other();
  }
  const link = section.elements[0]?.url;
  if (!link) {
    return matcher.other();
  }
  if (!isTargetUrl(link)) {
    return matcher.other();
  }
  const attachment = message.event.message.attachments.shift();
  if (!attachment) {
    return matcher.other();
  }
  return matcher.target(message.event.channel, link, attachment);
};
