const core = require('@actions/core');
const github = require('@actions/github');
// import * as anchor from "@project-serum/anchor";
// import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
// import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";


(async () => {
    const pk = core.getInput('wallet-key');
    const payload = github.context.payload;
    console.log(payload);

    // const programId = "FAuRwCnsvpMHVBDcL47SGM5XSC7oY5u5u9VU3GDqWaZm";
    // let connection = new Connection(clusterApiUrl("devnet"));
    // const wallet = new NodeWallet(Keypair.fromSecretKey(TexEncoder().encode(pk)));
    // const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());

    // const program = await new anchor.Program.at(programId, provider);

    // await program.methods.
    //     .releaseBounty()
    //     .accounts({
    //         bounty: null,
    //         poster: wallet.publickKey,
    //     }).rpc()
})();