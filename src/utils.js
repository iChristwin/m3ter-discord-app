import {
  EXPLORER,
  VOID_ADDRESS,
  M3TER_CONTRACT,
  DISCORD_CHANNEL,
  LISTINGS_CONTRACT,
} from "./config.js";

import { EmbedBuilder } from "discord.js";

async function getPrice(tokenId) {
  return "";
}

async function getMetadata(contract, tokenId) {
  const tokenURI = await contract.tokenURI(tokenId);
  const res = await fetch(tokenURI);
  return res.json();
}

async function createEmbed(metadata, owner, tokenId, action, price, color) {
  const explorerUrl = `${EXPLORER}/token/${M3TER_CONTRACT}/instance/${tokenId}`;
  const m3terName = metadata.name.replace(/\w+/g, function (w) {
    return w[0].toUpperCase() + w.slice(1).toLowerCase();
  });

  return new EmbedBuilder()
    .setColor(color)
    .setURL(explorerUrl)
    .setThumbnail(metadata.image)
    .setTitle(`${m3terName} has been ${action}!`)
    .addFields(
      { name: "Owner", value: owner },
      { name: "TokenId", value: tokenId.toString(), inline: true },
      { name: "Price", value: price, inline: true }
    )
    .setAuthor({ name: m3terName, url: explorerUrl, iconURL: metadata.image });
}

export async function handleTransfers(client, contract) {
  console.log("awaiting transfers");
  const channel = client.channels.cache.get(DISCORD_CHANNEL);

  contract.on("Transfer", async (from, to, tokenId, event) => {
    try {
      console.log("transfer detected");
      const metadata = await getMetadata(contract, tokenId);
      let price = "??",
        action = "transferred 📦",
        color = "White";

      if (from === VOID_ADDRESS) {
        action = "minted ✨";
        color = "Gold";
      } else if (to === VOID_ADDRESS) {
        action = "burned 🔥";
        color = "Red";
      } else if (to === LISTINGS_CONTRACT) {
        price = await getPrice(tokenId);
        action = "listed 🏷️";
        color = "Blue";
      } else if (from === LISTINGS_CONTRACT) {
        price = await getPrice(tokenId);
        action = "sold 💰";
        color = "Green";
      } else {
        console.log("Uninteresting transfer, no alert");
        return;
      }

      console.log(`this tx ${action} a M3ter`);
      const msg = await createEmbed(
        metadata,
        to,
        tokenId,
        action,
        price,
        color
      );
      channel.send({ embeds: [msg] });
      console.log("waiting again");
    } catch (err) {
      console.log(err);
    }
  });
}
