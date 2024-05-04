import dotenv from "dotenv";
import { ethers } from "ethers";
import { handleTransfers } from "./utils.js";
import ABI from "./abi.json" assert { type: 'json' };
import { Client, GatewayIntentBits, Collection } from "discord.js";

dotenv.config();

const discordChannel = ""; // exemple : 739518433779122191

const VOID_ADDRESS = "0x0000000000000000000000000000000000000000";
const M3TER_CONTRACT = "0x39fb420Bd583cCC8Afd1A1eAce2907fe300ABD02";
const DISCORD_CHANNEL = "";
const LISTINGS_CONTRACT = "";
const GNOSIS_RPC_ENDPOINT = "wss://rpc.gnosischain.com/wss";

const provider = new ethers.WebSocketProvider(GNOSIS_RPC_ENDPOINT);
const contract = new ethers.Contract(M3TER_CONTRACT, ABI, provider);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.commands = new Collection();

client.on("ready", () => {
  console.log("Bot ok");
});
client.login(process.env.TOKEN);

handleTransfers(contract);
