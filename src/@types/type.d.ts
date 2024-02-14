declare module "gas-webpack-plugin";

// https://api.slack.com/events/message?filter=Events
export type SlackMessageType = {
  type: string;
  challenge: string;
  event: SlackEventType & {
    subtype?: string;
  };
};

type SlackEventLinkElementType = {
  type: "link";
  url: string;
  text?: string;
};

type SlackEventRichTextSection = {
  type: "rich_text_section";
  elements: SlackEventLinkElementType[];
};

type SlackEventRichTextBlock = {
  type: "rich_text";
  block_id?: string;
  elements: SlackEventRichTextSection[];
};

export type SlackEventAttachments = {
  fallback: string;
  from_url: string;
  id: number;
  image_bytes: number;
  image_height: number;
  image_url: string;
  image_width: number;
  original_url: string;
  service_icon: string;
  service_name: string;
  text: string;
  title: string;
  title_link: string;
};

export type SlackEventType = {
  message: {
    user: string;
    client_msg_id: string;
    attachments: SlackEventAttachments[];
    blocks: SlackEventRichTextBlock[];
  };
  type: string;
  channel: string;
  ts: string;
  text: string;
};
