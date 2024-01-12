declare module "gas-webpack-plugin";

export type SlackMessageType = {
  type: string;
  challenge: string;
  event: SlackEventType & {
    subtype?: string;
  };
};

export type SlackEventType = {
  type: string;
  user: string;
  client_msg_id: string;
  channel: string;
  ts: string;
  text: string;
};
