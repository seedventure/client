function BlockchainProvider(url, newBlockCallback) {
    var context = this;

    context.url = url;
    context.newBlockCallback = newBlockCallback;

    var input = context.url;
    input.indexOf('ws') === 0 && (input = new Web3.providers.WebsocketProvider(input));
    context.web3 = new Web3(input);

    context.fetchLastBlockNumber = async function fetchLastBlockNumber() {
        return await context.web3.eth.getBlockNumber();
    };

    context.getChainId = async function getChainId() {
        if(context.chainId) {
            return context.chainId;
        }
        return (context.chainId = await context.web3.eth.net.getId());
    };

    context.retrieveBlock = async function retrieveBlock(blockNumber) {
        var block = await context.web3.eth.getBlock(blockNumber);
        context.newBlockCallback && setTimeout(() => context.newBlockCallback(block));
        return block;
    };

    context.retrieveTransaction = async function retrieveTransaction(transactionNumber) {
        return context.web3.eth.getTransaction(transactionNumber);
    };

    context.call = async function call(address, data) {

    };

    context.getNonce = async function getNonce(address) {
        return await context.web3.eth.getTransactionCount(address);
    };

    context.sendSignedTransaction = async function sendSignedTransaction(signedTransaction) {
        return await context.web3.eth.sendSignedTransaction(signedTransaction);
    }
};