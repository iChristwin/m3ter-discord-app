import {
  VOID_ADDRESS,
  M3TER_CONTRACT,
  DISCORD_CHANNEL,
  LISTINGS_CONTRACT,
} from "./config.js";

import { EmbedBuilder } from "discord.js";

export async function getPrice(tokenId) {}

export async function getMetadata(tokenId) {
  return fetch(await contract.tokenURI(tokenId)).then(async function (res) {
    return await res.json();
  });
}

function getSrcAttribute(data) {
  const attr = data.attributes.find(
    (attribute) => attribute.trait_type === "src"
  );
  return attr.value;
}

export async function prepMessage(
  metadata,
  owner,
  tokenId,
  action,
  price,
  color
) {
  const m3ter_name = metadata.name.replace(/\w+/g, function (w) {
    return w[0].toUpperCase() + w.slice(1).toLowerCase();
  });
  const version = getSrcAttribute(metadata);
  return new EmbedBuilder()
    .setTimestamp()
    .setColor(color)
    .setTitle(`${m3ter_name} has been ${action}!`)
    .setURL(
      `https://gnosis.blockscout.com/token/${M3TER_CONTRACT}/instance/${tokenId}`
    )
    .addFields(
      { name: "Owner", value: owner },
      { name: "TokenId", value: tokenId, inline: true },
      { name: "Price", value: price, inline: true }
    )
    .setAuthor({
      name: m3ter_name,
      iconURL: metadata.image,
      url: `https://gnosis.blockscout.com/token/${M3TER_CONTRACT}/instance/${tokenId}`,
    })
    .setFooter({
      text: version ? version : "M3ters",
      iconURL:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/51b66d3c-d9c4-4896-8403-fc32179fec00/original",
    });
}

export async function handleTransfers(client, contract) {
  const channel = client.channels.cache.get(DISCORD_CHANNEL);

  contract.on("Transfer", async (from, to, tokenId, event) => {
    if (from === VOID_ADDRESS) {
      const metadata = getMetadata(tokenId);
      const msg = await prepMessage(
        metadata,
        to,
        `${tokenId}`,
        "minted ✨",
        "??",
        "Gold"
      );
      channel.send({ embeds: [msg] });
    } else if (to === VOID_ADDRESS) {
      const metadata = getMetadata(tokenId);
      const msg = await prepMessage(
        metadata,
        from,
        `${tokenId}`,
        "burned 🔥",
        "??",
        "Red"
      );
      channel.send({ embeds: [msg] });
    } else if (to === LISTINGS_CONTRACT) {
      const metadata = getMetadata(tokenId);
      const price = getPrice(tokenId);
      const msg = await prepMessage(
        metadata,
        from,
        `${tokenId}`,
        "listed 🏷️",
        `$${price}`,
        "Blue"
      );
      channel.send({ embeds: [msg] });
    } else if (from === LISTINGS_CONTRACT) {
      const metadata = getMetadata(tokenId);
      const price = getPrice(tokenId);
      const msg = await prepMessage(
        metadata,
        from,
        `${tokenId}`,
        "sold 💰",
        `$${price}`,
        "Green"
      );
      channel.send({ embeds: [msg] });
    }
  });
}
