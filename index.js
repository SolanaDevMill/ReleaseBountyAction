const core = require('@actions/core');
const github = require('@actions/github');
const { clusterApiUrl, Connection, Keypair, PublicKey } = require("@solana/web3.js");
const anchor = require('@project-serum/anchor');
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/// TODO gonna have to just parse the issue from the description


(async () => {
    const pk = core.getInput('wallet-key');
    const payload = github.context.payload;
    const payeeUsername = payload.pull_request.merged_by.login;
    const repoName = payload.repository?.name;

    const issueNumber = Number.parseInt(payload.pull_request.body?.match(/DevMill Bounty: #(\d+)/)[1]);

    // console.log(JSON.stringify(payload, undefined, 2));

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
                const wallet = new anchor.Wallet(Keypair.fromSecretKey(bs58.decode(pk)));
                const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());

                const program = await anchor.Program.at(programId, provider);

                const [userPda, _] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode('user-account'), address.toBuffer()], program.programId);
                const userAccount = await program.account.userAccount.fetchNullable(userPda);
                
                const [pda, __] = PublicKey.findProgramAddressSync(
                    [Uint8Array.from(Buffer.from(anchor.utils.sha256.hash(`bounty${issueNumber}${repoName}`)))],
                    program.programId
                );

                await program.methods
                    .releaseBounty()
                    .accounts({
                        bounty: pda,
                        poster: wallet.publickKey,
                        recipient: address,
                        recipientAccount: userAccount
                    }).rpc()
            });
    } catch (err) {
        core.setFailed(err.message);
    }
    
})();