export async function getPrice(tokenId) {}

export async function getMetadata(tokenId) {
  return fetch(await contract.tokenURI(tokenId)).then(async function (res) {
    return await res.json();
  });
}

export function makeEmbed(metadata, owner, tokenId, action, price) {
  const channel = client.channels.cache.get(DISCORD_CHANNEL);
  const embed8 = new Discord.MessageEmbed()
    .setTitle(`**M3ter #${tokenId}** has been ${action}!`)
    .setURL(
      `https://gnosis.blockscout.com/token/${M3TER_CONTRACT}/instance/${tokenId}`
    )
    .addFields(
      { name: "Name : ", value: metadata.name },
      { name: "TokenId : ", value: tokenId, inline: true },
      {
        name: "Price : ",
        value: price,
      },
      {
        name: "Owner : ",
        value: `[${owner.substring(0, 6)}...${owner.substring(38, 42)}]
        (https://gnosis.blockscout.com/address/${owner})`,
        inline: true,
      }
    )
    .setImage(metadata.image)
    .setTimestamp()
    .setFooter("M3ters", "{*_*}")
    .setColor("RANDOM");
  channel.send(embed8);
}

export async function handleTransfers(contract) {
  contract.on("Transfer", (from, to, tokenId, event) => {
    if (from === VOID_ADDRESS) {
      const metadata = getMetadata(tokenId);
      makeEmbed(metadata, to, tokenId, "minted ✨", "??");
    } else if (to === VOID_ADDRESS) {
      const metadata = getMetadata(tokenId);
      makeEmbed(metadata, from, tokenId, "burned 🔥", "??");
    } else if (to === LISTINGS_CONTRACT) {
      const metadata = getMetadata(tokenId);
      const price = getPrice(tokenId);
      makeEmbed(metadata, from, tokenId, "listed 🏷️", `$${price}`);
    } else if (from === LISTINGS_CONTRACT) {
      const metadata = getMetadata(tokenId);
      const price = getPrice(tokenId);
      makeEmbed(metadata, from, tokenId, "sold 💰", `$${price}`);
    } else {
      // do nothing
    }
  });
}
