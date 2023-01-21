const core = require('@actions/core');
const github = require('@actions/github');
// import * as anchor from "@project-serum/anchor";
// import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
const { clusterApiUrl, Connection, Keypair, PublicKey } = require("@solana/web3.js");
const anchor = require('@project-serum/anchor');
const {NodeWallet} = requre('@project-serum/anchor/dist/cjs/nodewallet');


(async () => {
    const pk = core.getInput('wallet-key');
    const payload = github.context.payload;
    const payeeUsername = payload.pull_request.merged_by.login;
    const issueNumber = payload.pull_request._links.issue.number;
    const repoName = payload.repository?.name;

    try {
        fetch(`https://raw.githubusercontent.com/${payeeUsername}/${payeeUsername}/main/README.md`)
            .then(resp => resp.text())
            .then(async(text) => {
                const regex = /DevMill: ([1-9A-HJ-NP-Za-km-z]{32,44})/
                const match = text.match(regex);
                if (match === null) {
                    throw new Error('payee does not have DevMill setup');
                }
                const address = new PublicKey(match[1]);
                const programId = "FAuRwCnsvpMHVBDcL47SGM5XSC7oY5u5u9VU3GDqWaZm";
                let connection = new Connection(clusterApiUrl("devnet"));
                const wallet = new NodeWallet(Keypair.fromSecretKey(TexEncoder().encode(pk)));
                const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());

                const program = await new anchor.Program.at(programId, provider);

                const [userPda, _] = PublicKey.findProgramAddressSync([anchor.utils.bytes.encode('user-account'), address.toBuffer()], program.programId);
                const userAccount = program.account.userAccount.fetchNullable(userPda);

                await program.methods
                    .releaseBounty()
                    .accounts({
                        bounty: PublicKey.findProgramAddressSync([`bounty${issueNumber}${repoName}`], programId)[1],
                        poster: wallet.publickKey,
                        recipient: address,
                        recipientAccount: userAccount
                    }).rpc()
            });
    } catch (err) {
        core.setFailed(err.message);
    }
    
})();