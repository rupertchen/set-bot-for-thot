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


Misc
====

- Timestamps are in milliseconds (1/1,000 s)


Questions
=========

- How to pass a "before" arg throught Discord.js when fetching a message?

  - Just pass as a property in an object to fetch()

- Can the message ID in a "before" arg be used even if the message has been deleted?

  - Yes! The IDs appear to be in order, and the message ID doesn't event seem to have to exist in the channel.
