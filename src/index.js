import dotenv from "dotenv";
import { ethers } from "ethers";
import { handleTransfers } from "./utils.js";
import ABI from "./abi.json" assert { type: "json" };
import { Client, GatewayIntentBits, Collection } from "discord.js";
import { M3TER_CONTRACT, GNOSIS_RPC_ENDPOINT } from "./config.js";

dotenv.config();
const provider = new ethers.WebSocketProvider(GNOSIS_RPC_ENDPOINT);
const contract = new ethers.Contract(M3TER_CONTRACT, ABI, provider);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.commands = new Collection();

client.on("ready", async () => {
  console.log("Bot logged-in & online");
  handleTransfers(client, contract);
});

client.login(process.env.TOKEN);
