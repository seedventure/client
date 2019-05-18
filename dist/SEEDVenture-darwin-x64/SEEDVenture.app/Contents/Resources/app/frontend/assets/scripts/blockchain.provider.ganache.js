function BlockchainProvider(newBlockCallback) {
    var context = this;

    context.newBlockCallback = newBlockCallback;

    context.web3 = new Web3('http://localhost:8545');

    context.fetchLastBlockNumber = async function fetchLastBlockNumber() {
        return await context.web3.eth.getBlockNumber();
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
};