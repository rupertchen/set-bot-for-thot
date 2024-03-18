- https://discord.com/developers/docs/resources/channel#get-channel-messages

  - Need `VIEW_CHANNEL` and `READ_MESSAGE_HISTORY` perms.

  - Would be nice to delete from oldest to earliest, could traverse "back in time" by continually asking for older messages.

  - Maybe it would make sense to traverse up to N iterations back before just deleting something to make progress sooner.

- https://discord.com/developers/docs/resources/channel#delete-message

- https://discord.com/developers/docs/resources/channel#bulk-delete-messages

  - Requires `MANAGE_MESSAGES`.  Can only be done on guild channels, is that a problem?  What is a non-guild channel?

  - Will not delete mesages older than 2 weeks.  Should the bot deal with such messages individually?  Or not at all?

  - Supports `X-Audit-Log-Reason`

  - Supports 2 to 100 (inclusive) messages at a time




Ideas
=====

- Write a helper to check if there is at least one message older than a given timestamp.

- Write a helper to return up to 100 messages older than a given timestamp.

- Maybe a helper to traverse to the oldest message, up to some number of iterative fetches?


Hardcoded
=========

- Channel ID, #thot-ish: 1219259318835220542

- Channel ID, #general: 1211196488785600523
