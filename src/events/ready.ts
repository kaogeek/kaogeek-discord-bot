import Bot from "../client" 

export default {
    name: `ready`,
    once: true,
    async execute(client: Bot){
        console.log(`Helloworld, Online as ${client.user?.tag}.`);
    }
}