// utils/formatTextWithEmojis.js
import EmojiConvertor from "emoji-js";

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";
emoji.allow_native = true;

export function formatTextWithEmojis(text) {
  return emoji.replace_colons(text);
}

export function enhanceReply(reply, botType) {
  const styles = {
    lily: {
      emojis: ['💖', '🥺', '💦', '😳', '💋'],
      tweaks: text => text
        .replace(/\bi\b/g, 'I-I')
        .replace(/you/g, 'youu~')
        .replace(/\.\s*/g, '... ')
        + ' mmnh~',
    },
    plaksha: {
      emojis: ['😈', '🔥', '🖤', '👠'],
      tweaks: text => text
        .replace(/\./g, '. Hah...')
        .replace(/\byou\b/g, 'you pathetic little thing')
        + ' 😈',
    },
    raven: {
      emojis: ['😏', '😮‍💨', '💋', '🫦'],
      tweaks: text => text
        .replace(/\?/g, '? hmm~')
        .replace(/\./g, '... oops~')
        + ' 😮‍💨',
    },
  };

  const style = styles[botType.toLowerCase()];
  if (!style) return reply;
  const emoji = style.emojis[Math.floor(Math.random() * style.emojis.length)];
  const moaned = style.tweaks(reply);
  return formatTextWithEmojis(`${moaned} ${emoji}`);
}
