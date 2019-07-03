function BlockchainProvider(url) {
    var context = this;

    context.url = url;

    var input = context.url;
    input && input.indexOf('ws') === 0 && (input = new Web3.providers.WebsocketProvider(input));
    context.web3 = new Web3(input);

    context.fetchLastBlockNumber = async function fetchLastBlockNumber() {
        return await context.web3.eth.getBlockNumber();
    };

    context.getChainId = async function getChainId() {
        if (context.chainId) {
            return context.chainId;
        }
        return (context.chainId = await context.web3.eth.net.getId());
    };

    context.retrieveEvents = async function retrieveEvents(fromBlock, toBlock, address, topics) {
        !fromBlock && (fromBlock = '0');
        !toBlock && (toBlock = await context.getBlockNumber());
        fromBlock = fromBlock.toString();
        toBlock = toBlock.toString();
        var events = await context.web3.eth.getPastLogs({
            fromBlock,
            toBlock,
            address,
            topics
        });
        return events;
    };

    context.retrieveTransaction = async function retrieveTransaction(transactionNumber) {
        return context.web3.eth.getTransaction(transactionNumber);
    };

    context.call = async function call(to, data) {
        return await context.web3.eth.call({
            to,
            data
        });
    };

    context.getNonce = async function getNonce(address) {
        return await context.web3.eth.getTransactionCount(address);
    };

    context.sendSignedTransaction = async function sendSignedTransaction(signedTransaction) {
        return await context.web3.eth.sendSignedTransaction(signedTransaction);
    }

    context.balanceOf = async function balanceOf(address) {
        return await context.web3.eth.getBalance(address);
    }
};