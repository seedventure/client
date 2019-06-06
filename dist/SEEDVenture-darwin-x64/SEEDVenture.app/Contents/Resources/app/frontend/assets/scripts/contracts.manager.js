function ContractsManager() {
    var context = this;

    context.SEEDTokenAddress = "0x89bf1ddd4cedcb36d168583ba6c30122549e33d1"
    context.factoryAddress = "0xdef";
    context.dexAddress = "0xghi";

    context.getList = function getList() {
        var list = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.list);
        if(list === undefined || list === null) {
            list = [];
        }
        return list;
    };

    context.getDictionary = function getDictionary() {
        context.dictionary = [];
        context.dictionary.push({
            address : context.factoryAddress.toLowerCase(),
            type : 'factory'
        });
        context.dictionary.push({
            address : context.dexAddress.toLowerCase(),
            type : 'dex'
        });
        context.dictionary.push({
            address : context.SEEDTokenAddress.toLowerCase(),
            type : 'SEEDToken'
        });
        var list = context.getList();
        for(var i in list) {
            var element = list[i];
            context.dictionary.push({
                address : element.tokenAddress.toLowerCase(),
                type : 'token',
                element : element,
                position : i
            });
            context.dictionary.push({
                address : element.fundingPanelAddress.toLowerCase(),
                type : 'fundingPanel',
                element : element,
                position : i
            });
            context.dictionary.push({
                address : element.adminsToolsAddress.toLowerCase(),
                type : 'adminsTools',
                element : element,
                position : i
            });
        }
        return (context.dictionary = Enumerable.From(context.dictionary));
    };

    context.manage_factory_0xaabbccdd = function test() {
        console.log(JSON.stringify(arguments));
    };

    context.manage_dex_0xaabbccdd = function ciao() {
        console.log(JSON.stringify(arguments));
    };

    context.manage_SEEDToken_0xa9059cbb = function ciao() {
        //alert('New Notification!');
    };

}