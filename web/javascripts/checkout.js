var JSON = JSON || {};

JSON.parse = JSON.parse || function (obj) {
    'use strict';
    return eval("(" + obj + ")");
};
// implement JSON.stringify serialization
JSON.stringify = JSON.stringify || function (obj) {
    'use strict';
    var t = typeof obj;
    if (t !== "object" || obj === null) {
        // simple data type
        if (t === "string") {
            obj = '"' + obj + '"';
        }
        return String(obj);
    }
    // recurse array or object
    var n, v, json = [], arr = (obj && obj.constructor === Array);
    for (n in obj) {
        v = obj[n]; 
        t = typeof v;
        if (t === "string") {
            v = '"' + v + '"';
        } else if (t === "object" && v !== null) {
            v = JSON.stringify(v);
        }
        json.push((arr ? "" : '"' + n + '":') + String(v));
    }
    return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");

};
if (typeof Array.prototype.filter !== "function") {
    Array.prototype.filter = function (fun) {
        'use strict';
        if (this === void 0 || this === null) {
          throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
          throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
          if (i in t) {
            var val = t[i];
            if (fun.call(thisArg, val, i, t)) {
              res.push(val);
            }
          }
        }
        return res;
    };
}
(function(){
    var Checkout, paymentMethods, _i, _len, 
        baseUrl = "https://api.mercadolibre.com/checkout/custom/beta",
        __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)){ child[key] = parent[key]; }} function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
        _this = this;

    this.Checkout = function () {
        
        function Checkout() {}

        Checkout.version = "1.2";

        Checkout.setPublishableKey = function(publicKey){
            Checkout.key = publicKey;
        };
        return Checkout;
    }.call(this);

    Checkout = this.Checkout;

    this.Checkout.trackErrors = function(data){
        
        var url = baseUrl + "/track_error?public_key="+Checkout.key + "&js_version="+Checkout.version;
        
        Checkout.request.AJAX({
            url: url,
            method : "POST",
            data:data,
            timeout : 5000
        });
    };

    this.Checkout.token = function () {

        function token() {}

        token.cardTokenUrl="https://pagamento.mercadopago.com/card_tokens";
        
        token.formatData = function (data, whitelistedAttrs, callback) {
          
            if(Checkout.utils.isElement(data)){
                data = Checkout.utils.paramsFromForm(data);
                Checkout.card.validate(data, function(validateResult){
                    if(validateResult.length){
                        data = validateResult;
                        Checkout.trackErrors({status:400, type:"validateForm", data:data});
                    }
                    callback(data);
                });
            }else{
                callback(data);
            }
        };
        token.create = function (params, callback) {
            Checkout.utils.validateKey(Checkout.key); 

            params.card["public_key"] = Checkout.key;

            token.post(params, callback);  
        };
        token.mappingCard = function(data){
            var tokenData = {};

            if(data.cardId && data.cardId !== "" && data.cardId !== "-1") {
                tokenData["card_id"] = data.cardId;
                tokenData["security_code"] = data.securityCode;
                return tokenData;    
            }

            tokenData["card_number"] = data.cardNumber;
            tokenData["security_code"] = data.securityCode;
            tokenData["expiration_month"] = parseInt(data.cardExpirationMonth,10);
            tokenData["expiration_year"] = parseInt(data.cardExpirationYear,10);
            tokenData["cardholder"] = {"name" : data.cardholderName};
            tokenData["cardholder"]["identification"] = { "type": (data.docType===""||data.docType===undefined)?null:data.docType,
                                                    "subtype": (data.subDocType===""||data.subDocType===undefined)?null:data.subDocType,
                                                    "number": (data.docNumber===""||data.docNumber===undefined)?null:data.docNumber
                                                    };

            return tokenData;
        };
    
        token.post = function(dataObj, callback){
       
            var _method, url = token.cardTokenUrl, _body;
            
            if(Checkout.tokenId == null){
                _method = "POST";
                url += "?_body={}&";
            }else{
                _method = "PUT";
                _body = JSON.stringify(token.mappingCard(dataObj.card));
                url += "/"+Checkout.tokenId+"?_body="+_body+"&";
            }

            url+="_method="+_method+"&public_key="+Checkout.key + "&js_version="+Checkout.version;
            
            Checkout.request.JSONP({
                method: _method,
                url : url,
                timeout : 10000,
                error : function(status, response) { 
                    Checkout.trackErrors({status:status, type:"cardForm", data:response});
                    typeof callback == "function" ?  callback(status, response) : null;
                },
                success : function(status,response){
                    typeof callback == "function" ?  callback(status, response) : null;
                }
            });
        };

        return token;
    }.call(this);

    this.Checkout.card = (function(_super) {

        __extends(card, _super);

        function card() {
            return card.__super__.constructor.apply(this, arguments);
        }
        card.tokenName = "card";

        card.whitelistedAttrs = ["cardNumber", "securityCode", "cardExpirationMonth", "cardExpirationYear","cardExpiration", "cardIssuerId"];

        card.docTypes = { "MLB" : [{id:"CPF",name:"CPF"}],
                            "MLA" : [{id:"DNI",name:"DNI"},
                                    {id:"CI",name:"Cédula"},
                                    {id:"LC",name:"L.C."},
                                    {id:"LE",name: "L.E."},
                                    {id:"Otro",name: "Otro"}],
                            "MCO" : [{id:"CC",name:"C.C."},
                                    {id:"CE",name:"C.E."},
                                    {id:"NIT",name:"NIT"},
                                    {id:"Otro",name:"Otro"}],
                            "MLV" : [{id:"CI",name:"CI"},
                                    {id:"RIF",name:"RIF"},
                                    {id:"Pasaporte",name:"Pasaporte"}]
                        };
        card.subDocTypes = {"MLV":{ "CI" :["V","E"],
                                    "RIF" :["J", "P", "V", "E", "G"],
                                    "Pasaporte" :["P"]
                                }
                            };  
        card.lengthByDocType = {"CPF": {"min":11, "max": 11}, 
                                "DNI": {"min":7, "max": 8},
                                "CI": {"min":1, "max": 9},
                                "LC": {"min":6, "max": 7},
                                "LE": {"min":6, "max": 7},
                                "NIT": {"min":5, "max": 20},
                                "CC": {"min":5, "max": 20},
                                "CE": {"min":5, "max": 20},
                                "RIF": {"min":1, "max": 9},
                                "Pasaporte": {"min":1, "max": 20},
                                "Otro": {"min":5, "max": 20}
                            };

        card.requiredParamsCodes = {"cardholderName": {code: "221", description: "parameter cardholderName can not be null/empty"},
                        "docNumber" : {code: "214", description: "parameter docNumber can not be null/empty"},
                        "docType" : {code: "212", description: "parameter docType can not be null/empty"},
                        "subDocType" : {  code: "213", description: "The parameter cardholder.document.subtype can not be null or empty"},
                        "cardNumber": { "code" : "205", description: "parameter cardNumber can not be null/empty"},
                        "securityCode": { code: "224",description: "parameter securityCode can not be null/empty"},
                        "cardExpirationMonth": { code: "208", description: "parameter cardExpirationMonth can not be null/empty"},
                        "cardExpirationYear": {code: "209", description: "parameter cardExpirationYear can not be null/empty"},
                        "cardIssuerId": {code: "220", description: "parameter cardIssuerId can not be null/empty"}
                    };
        card.invalidParamsCode = { "cardholderName": { code: "316", description: "invalid parameter cardholderName"},
                        "docNumber" : {code: "324", description: "invalid parameter docNumber"},
                        "docType" : {  code: "322", description: "invalid parameter docType"},
                        "subDocType" : {  code: "323", description: "Invalid parameter cardholder.document.subtype"},
                        "cardNumber": { code: "E301", description: "invalid parameter cardNumber" },
                        "securityCode": { code: "E302", description: "invalid parameter securityCode"},
                        "cardExpirationMonth":  {code: "325", description: "invalid parameter cardExpirationMonth"},
                        "cardExpirationYear": {code: "326", description: "invalid parameter cardExpirationYear"}
        };

        card.createToken = function (data, callback) {
            var params = {};

            Checkout.token.formatData(data, card.whitelistedAttrs, 
                function(response){
                    params[card.tokenName] = response;
                    if(!params[card.tokenName][0]){
                        return Checkout.token.create(params, callback);
                    }else{
                        return callback(400,{error : "bad_request", message: "invalid parameters", cause: params[card.tokenName]});
                    }
                });
        };

        card.validateCardNumber = function (cardNumber, pm, callback) {
            
            cardNumber = Checkout.utils.clear(cardNumber);
            if(callback == undefined && (typeof pm == "function")){
                callback = pm;
            }

            Checkout.paymentMethods.getPaymentMethod(typeof pm !="function"? pm:cardNumber,
                function(status,data){
                    var result = false, config;
                    if(status == 200){
                        for(var j=0; j < data.length && !result; j++){
                            config = data[j].card_configuration;
                            for (var i=0; i < config.length && !result; i++){
                                result = cardNumber.length == config[i].card_number_length && card.validateBin(cardNumber,config[i]) && ( config[i].luhn_algorithm == "none" ||  card.luhnCheck(cardNumber));
                            }
                        }
                    }
                    typeof callback == "function" ? callback(status,result) : null;
            });
        };

        card.validateSecurityCode = function (securityCode, pm, callback) {
            securityCode = Checkout.utils.clear(securityCode);

            if(!(/^\d+$/.test(securityCode))){
                return typeof callback == "function" ? callback(200,false) : null;
            }

            Checkout.paymentMethods.getPaymentMethod(pm,
                function(status,data){
                    var result= false;
                    if(status == 200){
                        var config = data[0] ? data[0].card_configuration : [];
                        for (var i=0;i<config.length && !result ; i++){
                            result = !config[i].security_code_length || securityCode.length == config[i].security_code_length;
                        }
                    }else{ 
                        result = true;
                    }
                    typeof callback == "function" ? callback(status,result) : null;
            });
        };
        card.validateAdditionalInfoNeeded = function(params, errors, callback){
            var index = errors.length;

            Checkout.paymentMethods.getPaymentMethod(params["cardNumber"],
                function(status,data){
                   
                    if(status == 200){
                        var config = data[0] ? data[0].card_configuration : [];

                        for (var i=0;i<config.length ; i++){
                            for (var j=0; j<config[i].additional_info_needed.length; j++) {
                                switch (config[i].additional_info_needed[j]){
                                    case "cardholder_name":
                                        if(!params["cardholderName"] || params["cardholderName"]===""){
                                            errors[index++] = card.requiredParamsCodes["cardholderName"];
                                        }else if(!card.validateCardHolderName(params["cardholderName"])){
                                            errors[index++] = card.invalidParamsCode["cardholderName"];
                                        }   
                                        break;
                                    case "cardholder_identification_type": 
                                        if(!params["docType"] || params["docType"]===""){
                                            errors[index++] = card.requiredParamsCodes["docType"];
                                        }else if(card.lengthByDocType[params["docType"]]==undefined){
                                            errors[index++] = card.invalidParamsCode["docType"];
                                        }
                                        break;
                                    case "cardholder_identification_sub_type": 
                                        if(!params["subDocType"] || params["subDocType"]===""){
                                            errors[index++] = card.requiredParamsCodes["subDocType"];
                                        }else if(params["docType"] && !card.validateSubDocType(data[0].site_id,params["docType"],params["subDocType"])){
                                            errors[index++] = card.invalidParamsCode["subDocType"];
                                        }
                                        break;
                                    case "cardholder_identification_number":  
                                        if(!params["docNumber"] || params["docNumber"]===""){
                                            errors[index++] = card.requiredParamsCodes["docNumber"];
                                        }else if(!card.validateDocNumber(params["docType"],params["docNumber"])){
                                            errors[index++] = card.invalidParamsCode["docNumber"];
                                        }
                                        break;
                                }
                            }
                        }
                    }
                    typeof callback == "function" ? callback(status, errors) : null;
                });
        };

        card.validateExpiry = function (month, year) {
            var currentTime, expiry;
            month = Checkout.utils.trim(month);

            if(year == undefined){
                if (month.split('/').length==1){ 
                    return false;
                }
                year = month.split('/')[1];
                month = month.split('/')[0];
            }
            year = Checkout.utils.trim(year);
            if(year.length==2){
                year="20"+year;
            }
           
            if(!(/^\d+$/.test(month))){
                return false;
            }
            if(!(/^\d+$/.test(year))){
                return false;
            }
            if (!(parseInt(month, 10) <= 12)) {
                return false;
            }
            expiry = new Date(year, month);
            currentTime = new Date;
            expiry.setMonth(expiry.getMonth() - 1);
            expiry.setMonth(expiry.getMonth() + 1, 1);
            return expiry > currentTime;
        };

        card.validateCardHolderName = function(cardholderName){
            var regExPattern = "^[a-zA-ZãÃáÁàÀâÂäÄẽẼéÉèÈêÊëËĩĨíÍìÌîÎïÏõÕóÓòÒôÔöÖũŨúÚùÙûÛüÜçÇ’ñÑ .']*$";
            return cardholderName.match(regExPattern)?true:false;
        }; 
        
        card.validateDocNumber = function(docType,docNumber){
            docNumber = Checkout.utils.clear(docNumber);
            return docType && docNumber && card.lengthByDocType[docType] && card.lengthByDocType[docType]["min"] <=  docNumber.length && docNumber.length <= card.lengthByDocType[docType]["max"];
        };
        card.validateSubDocType = function(siteId,docType,subDocType){
            return (docType && subDocType && card.subDocTypes[siteId][docType] && card.subDocTypes[siteId][docType].indexOf(subDocType) != -1 );
        };
        card.getDocTypes = function(siteId){
            return card.docTypes[siteId];
        };
        card.getSubDocTypes = function(siteId){
            return card.subDocTypes[siteId];
        };
        card.luhnCheck = function (num) {
            var digit, digits, odd, sum, _i, _len;
            odd = true;
            sum = 0;
            digits = (num + '').split('').reverse();
            for (_i = 0, _len = digits.length; _i < _len; _i++) {
                digit = digits[_i];
                digit = parseInt(digit, 10);
                if ((odd = !odd)) {
                  digit *= 2;
                }
                if (digit > 9) {
                  digit -= 9;
                }
                sum += digit;
            }
            return sum % 10 === 0;
        }; 

        card.validateBin = function(cn,config){
            var bin = cn.slice(0, 6);
            return bin.match(config.bin_card_pattern)?true:false && ( !config.bin_card_exclusion_pattern || !bin.match(config.bin_card_exclusion_pattern));
        };

        card.getErrorCause = function(error){
            return card.requiredParamsCodes[error]; 
        };

        card.validate = function(params, callback){
            var attr,index=0, errors = [], callApi = false;
            
            if(params["cardId"] && params["cardId"]!=="" && params["cardId"]!=="-1"){
                if(!params["securityCode"]){
                    errors[index++] = card.requiredParamsCodes["securityCode"];
                }
                callback(errors);
                return;
            }
            if(params["cardExpiration"]!=undefined && (params["cardExpirationMonth"]==undefined || params["cardExpirationYear"]==undefined)){
                params["cardExpirationMonth"] = params["cardExpiration"].split('/')[0];
                params["cardExpirationYear"] = params["cardExpiration"].split('/')[1];
            }else{
                params["cardExpiration"] = params["cardExpirationMonth"] + "/" + params["cardExpirationYear"];
            }
            if(params["cardExpirationYear"] && params["cardExpirationYear"].length==2){
                params["cardExpirationYear"] = ("20"+params["cardExpirationYear"]);
            }
            
            params["docNumber"] = Checkout.utils.clear(params["docNumber"]);

            for(var i = 0; i < card.whitelistedAttrs.length; i++){
                attr = card.whitelistedAttrs[i];
                if(attr == "cardNumber" || attr == "securityCode"){
                    params[attr] = Checkout.utils.clear(params[attr]);
                }
                if((!params[attr] || params[attr]==="") && attr!=="cardIssuerId"){
                    errors[index++] = card.requiredParamsCodes[attr];
                }   
            }

            if(!card.validateExpiry(params["cardExpirationMonth"],params["cardExpirationYear"])){
                errors[index++] = card.invalidParamsCode["cardExpirationMonth"];
                errors[index++] = card.invalidParamsCode["cardExpirationYear"];
            }
          
            
            card.validateCardNumber(params["cardNumber"],params["cardNumber"].slice(0, 6),
                function(status,result){
                    if(!result){
                        errors[index++] = card.invalidParamsCode["cardNumber"];
                    }
                    card.validateSecurityCode(params["securityCode"],params["cardNumber"].slice(0, 6),
                        function(status,result){
                        if(!result){
                            errors[index++] = card.invalidParamsCode["securityCode"];
                        }

                        card.validateAdditionalInfoNeeded(params, errors, 
                            function(status, errors){
                                callback(errors);
                        });
                    });
            });
        };

        return card;
    }).call(this, this.Checkout.token);

    exports = ["createToken", "validateExpiry", "validateSecurityCode", "validateCardNumber","validateCardHolderName", "validateDocNumber","validateSubDocType","getDocTypes","getSubDocTypes"];
    
    for (_i = 0, _len = exports.length; _i < _len; _i++) {
        key = exports[_i];
        this.Checkout[key] = this.Checkout.card[key];
    }
    
    this.Checkout.clearSession = function(){
            Checkout.tokenId = null;
            Checkout.createToken({}, getPixels);
    };
    this.Checkout.paymentMethods = (function(_super) {

        __extends(paymentMethods, _super);

        function paymentMethods() {
           
            return paymentMethods.__super__.constructor.apply(this, arguments);
        }
        
        paymentMethods.guessedPaymentMethods = {};
        paymentMethods.acceptedPaymentMethods = [];
        paymentMethods.acceptedCardIssuers = [];
        paymentMethods.fullCardIssuers = [];
        
        paymentMethods.paymentMethodsCodesError = {
            400 : {status:400, error: "bad_request", cause: {code:"400",description:"There is more than one payment method available"}},
            404 : {status:404, error: "not_found", cause: {code:"404",description:"Not found paymentMethod"}}
        };

        paymentMethods.setPaymentMethods = function(pm){
            paymentMethods.acceptedPaymentMethods = pm;
        };

        paymentMethods.getPaymentMethods = function(){
            return paymentMethods.acceptedPaymentMethods;
        }; 

        paymentMethods.getPaymentMethod = function(id,amount,callback,pmethod){
            var data;
            if(typeof amount == "function"){
                if(callback!=undefined){
                    pmethod = callback;
                }
                callback = amount;
                amount = null;
            }
            
            var _acceptedPaymentMethods = paymentMethods.getPaymentMethods();
            if(_acceptedPaymentMethods.length !== 0){
                data = _acceptedPaymentMethods.filter(function(pm){
                        return pm.id==id;
                    });
            }
            if((!data || (data && data.length === 0)) && paymentMethods.guessedPaymentMethods!==undefined){
                data = paymentMethods.guessedPaymentMethods[id];
            }
            if (!data || (data && data.length === 0)){
                paymentMethods.searchPaymentMethods(id,amount,callback,pmethod);
            }else if (typeof callback == "function"){
                callback(200 ,data);
            }else{
                return data;
            }
        };

        paymentMethods.getAllPaymentMethods = function(callback){
            var url = baseUrl + "/payment_methods?public_key="+Checkout.key + "&js_version="+Checkout.version; 
            var _success = function(status,response){
                paymentMethods.setPaymentMethods(response);
                typeof callback == "function" ?  callback(status, response) : null;
            };

            Checkout.request.AJAX({
                method : "GET",
                url : url,
                success : _success,
                error : function(status,response){
                    Checkout.trackErrors({status:status, type:"getAllPaymentMethods", data:response});
                    typeof callback == "function" ?  callback(status, response) : null;
                }
            });
        };
        paymentMethods.searchPaymentMethods = function(id,amount,callback,pmethod){
            var url =  baseUrl + "/payment_methods/search?public_key="+Checkout.key + "&js_version="+Checkout.version; 
            id = Checkout.utils.clear(id);

            if(this.guessedPaymentMethods!=undefined && this.guessedPaymentMethods[id]){
                return (typeof callback == "function" ?  callback(200 , this.guessedPaymentMethods[id]) : null);
            }
            if(!id||id===null||id===undefined||id==="null"){
                return typeof callback == "function" ?  callback(404, {status:404, error : "not_found", cause:[]}, {id:id, amount:amount}) : null; 
            }
            if(!(/^([a-zA-Z])*$/.test(id))){
                id = id.replace(/[^0-9]/g, "").slice(0, 6);
            }
            if (/^([0-9])*$/.test(id)){
                url += "&bin=" + id;
                if(pmethod!=undefined){
                    url += "&payment_method="+pmethod;
                }
            }else{
                url += "&payment_method=" + id;
            }
            if(amount!=undefined){
                url += "&amount=" + amount;
            }

            var _success = function(status, data){
                    paymentMethods.guessedPaymentMethods[id] = data;
                    if(/^([0-9])*$/.test(id) && data[0] && data[0].id){
                        paymentMethods.guessedPaymentMethods[data[0].id] = data;
                    }
                    typeof callback == "function" ?  callback(status, data, {id:id, amount:amount}) : null;
            };

            Checkout.request.AJAX({
                method : "GET",
                url : url,
                timeout : 10000,
                error : function(status, response) {
                        Checkout.trackErrors({status:status, type:"searchPaymentMethods", data:response});
                        typeof callback == "function" ?  callback(status, response, {id:id, amount:amount}) : null;
                },
                success: function(status, response) {
                        _success(status,response);
                }
            });
        };

        paymentMethods.getAcceptedCardIssuers = function(callback){
            var url = baseUrl + "/card_issuers?public_key=" + Checkout.key + "&js_version=" + Checkout.version; 

            if(paymentMethods.acceptedCardIssuers.length>0){
                return typeof callback == "function" ?  callback(200, paymentMethods.acceptedCardIssuers) : null;
            }
            var _success = function(status,response){
                paymentMethods.acceptedCardIssuers = response;
                typeof callback == "function" ?  callback(status, response) : null;
            };

            Checkout.request.AJAX({
                method : "GET",
                url : url,
                timeout : 10000,
                error : function(status, response) { 
                    Checkout.trackErrors({status:status, type:"cardIssuers", data:response});
                    typeof callback == "function" ?  callback(status, response) : null;
                },
                success: function(status, response) {
                    _success(status,response);
                }
            });
        };
        
        paymentMethods.getCardIssuers = function(id,callback){
            paymentMethods.getPaymentMethod(id,
                function(status, data){
                    if(status!=200 || data.length>1){
                        var messageError = status==200?paymentMethods.paymentMethodsCodesError[400]:data;
                        return typeof callback == "function" ? callback(status,messageError) : null;
                    }
                    paymentMethods.getAcceptedCardIssuers(function(s, r){
                        if(s==200){
                            var issuers = r[data[0].payment_type_id][data[0].id];
                            return typeof callback == "function" ?  callback(200,issuers) : null;
                        }else{
                            return typeof callback == "function" ? callback(s,r) : null;
                        }
                    });
            });
        };

         paymentMethods.getCustomizedCardIssuers = function(id,callback){
            paymentMethods.getPaymentMethod(id,
                function(status, data){
                    if(status!=200 || data.length>1){
                        var messageError = status==200?paymentMethods.paymentMethodsCodesError[400]:data;
                        return typeof callback == "function" ? callback(status==200?400:status,messageError) : null;
                    }
                    paymentMethods.getFullCardIssuers(data[0].site_id,function(s, r){
                        if(s==200){
                            var result = r.filter(function(pt){
                                            return pt.payment_type_id==data[0].payment_type_id;
                                        });
                            if(result.length===0){
                                return typeof callback == "function" ?  callback(404,[]) : null;    
                            }
                            var issuers = result[0].payment_methods.filter(function(pm){
                                            return pm.id==data[0].id;
                                        });
                            return typeof callback == "function" ?  callback(200,issuers[0].issuers) : null;
                        }else{
                            return typeof callback == "function" ? callback(s,r) : null;
                        }
                    });
            });
        };

        paymentMethods.getFullCardIssuers = function(siteId,callback){
            var url = "https://api.mercadolibre.com/sites/"+siteId+"/card_issuers/search?public_key=" + Checkout.key + "&js_version="+Checkout.version;

            if(paymentMethods.fullCardIssuers.length>0){
                return typeof callback == "function" ?  callback(200, paymentMethods.fullCardIssuers) : null;
            }
            var _success = function(status,response){
                paymentMethods.fullCardIssuers = response.results;
                typeof callback == "function" ?  callback(status, response.results) : null;
            };

             Checkout.request.AJAX({
                method : "GET",
                url : url,
                timeout : 10000,
                error : function(status, response) { 
                    Checkout.trackErrors({status:status, type:"cardIssuersSearch", data:response});
                    typeof callback == "function" ?  callback(status, response) : null;
                },
                success: function(status, response) {
                    _success(status,response);
                }
            });
        };


        paymentMethods.getInstallments = function(id,amount,callback){
            
            paymentMethods.getPaymentMethod(id,
                function(status, data){
                    if(status!=200 || data.length>1){
                        var messageError = status==200?paymentMethods.paymentMethodsCodesError[400]:data;
                        return typeof callback == "function" ? callback(status,messageError): null;
                    }
                    typeof callback == "function" ?  callback(200 , paymentMethods.fillInstallments(data[0].payer_costs, amount)) : null;
            });
        };
         paymentMethods.getInstallmentsByIssuerId = function(id,cardIssuerId,amount,callback){
            
            paymentMethods.getPaymentMethod(id,
                function(status, data){
                    if(status!=200 || data.length>1){
                        var messageError = status==200?paymentMethods.paymentMethodsCodesError[400]:data;
                        return typeof callback == "function" ? callback(status,messageError): null;
                    }
                    var _success = function(pmt){
                        var installments = pmt.payer_costs;
                        for(var i=0; i<pmt.exceptions_by_card_issuer.length;i++){
                            if(pmt.exceptions_by_card_issuer[i].card_issuer.id == cardIssuerId){
                                installments = pmt.exceptions_by_card_issuer[i].payer_costs;
                            }
                        }
                        typeof callback == "function" ?  callback(200 , paymentMethods.fillInstallments(installments, amount)) : null;
                    };
                    var _acceptedPaymentMethods = paymentMethods.getPaymentMethods();
                    if(_acceptedPaymentMethods.length!==0){
                        var pmt = _acceptedPaymentMethods.filter(function(pm){
                            return pm.id==data[0].id;
                        }); 
                        _success(pmt?pmt[0]:data[0]);
                    }else{
                        paymentMethods.getAllPaymentMethods(function(s,r){
                            var pmt; 
                            if(s==200){
                                pmt = r.filter(function(pm){
                                    return pm.id==data[0].id;
                                }); 
                            }
                            _success(pmt?pmt[0]:data[0]);
                        });
                    }
            });
        };

        paymentMethods.fillInstallments = function(payerCosts, amount){

            var min,max,floatAmount = parseFloat(amount), costs=[];
            for (var i=0; i < payerCosts.length; i++){
                min = parseFloat(payerCosts[i].min_allowed_amount);
                max = parseFloat(payerCosts[i].max_allowed_amount);
                if(min <= floatAmount && floatAmount <= max){
                    share = (floatAmount * (1 + payerCosts[i].installment_rate/100)/payerCosts[i].installments).toFixed(2);          
                    costs[i] = {installments : payerCosts[i].installments, 
                                installment_rate: payerCosts[i].installment_rate,
                                share_amount: share,
                                total_amount:(payerCosts[i].installment_rate>0?(share*payerCosts[i].installments):floatAmount).toFixed(2)
                            };
                }
            }
            return costs;
        };

        return paymentMethods;

    }).call(this, this.Checkout.token);

    exports = ["setPaymentMethods","getPaymentMethods","getAllPaymentMethods","getPaymentMethod","getInstallments","getCardIssuers","getInstallmentsByIssuerId","getAcceptedCardIssuers","getCustomizedCardIssuers"];
    
    for (_i = 0, _len = exports.length; _i < _len; _i++) {
        key = exports[_i];
        this.Checkout[key] = this.Checkout.paymentMethods[key];
    }

    if (typeof module !== "undefined" && module !== null) {
        module.exports = this.Checkout;
    }

    if (typeof define === "function") {
        define('checkout', [], function() {
            return _this.Checkout;
        });
    }
}).call(this);
(function () {
    var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item){ return i; }} return -1; };
    
    this.Checkout.utils = function () {
        
        function utils() {}

        utils.trim = function (value) {
            return (value + "").replace(/^\s+|\s+$/g, "");
        };
        utils.clear = function(value){
            return utils.trim(value).replace(/\s+|-/g, "");
        };
        utils.isElement = function(el) {
            if (typeof el !== 'object') {
                return false;
            }
            /*if ((typeof jQuery !== "undefined" && jQuery !== null) && el instanceof jQuery) {
                return true;
            }*/
            return el.nodeType === 1;
        };
        utils.paramsFromForm = function (form) {
            var attr, input, inputs, select, selects, values, _i, _j, _len, _len1;
            /*
            if ((typeof jQuery !== "undefined" && jQuery !== null) && form instanceof jQuery) {
                form = form[0];
            }*/
            inputs = form.getElementsByTagName('input');
            selects = form.getElementsByTagName('select');
            values = {};
            for (_i = 0, _len = inputs.length; _i < _len; _i++) {
                input = inputs[_i];
                attr = input.getAttribute('data-checkout');
               
                values[attr] = input.value;
            }
            for (_j = 0, _len1 = selects.length; _j < _len1; _j++) {
                select = selects[_j];
                attr = select.getAttribute('data-checkout');
               
                if (select.selectedIndex !== null && select.selectedIndex !== -1 ) {
                  values[attr] = select.options[select.selectedIndex].value;
                }
            }
            return values;
        };
        utils.validateKey = function (e) {
            if (!e || typeof e != "string"){ throw new Error("You did not set a valid publishable key. Call Checkout.setPublishableKey() with your public_key.");}
            if (/\s/g.test(e)){ throw new Error("Your key is invalid, as it contains whitespacCheckout.");}
        }; 
        return utils;
    }();
    this.Checkout.request = function(){
        
        function request(){};
        
        request.AJAX = function(options){
            var req = window.XDomainRequest ?  (new XDomainRequest()): (new XMLHttpRequest()), data; 
            
            req.open(options.method, options.url, true);

            req.timeout = options.timeout || 1000;

            req.ontimeout = function () { 
                // do something
            }

            if (window.XDomainRequest) {
                req.onload = function(){
                    // IF por 400
                    data = JSON.parse(req.responseText);
                    if (typeof options.success === "function") {
                        options.success(options.method==='POST'?201:200,data);
                    }
                };
                req.onerror = function(){
                    // probar window.error
                    var args = arguments.length >= 1 ? Array.prototype.slice.call(arguments, 0) : [];
                    if(typeof options.error === "function"){
                        options.error(404,{user_agent:window.navigator.userAgent, error : "not_found", cause:[]});
                    }
                }
            }else{
                
                if(options.contentType!==null){
                   req.setRequestHeader('Content-Type', options.contentType);
                }

                req.onreadystatechange = function() {
                    if (this.readyState === 4){
                        if (this.status >= 200 && this.status < 400){
                          // Success!
                            data = JSON.parse(this.responseText);
                            if (typeof options.success === "function") {
                                options.success(this.status, data);
                            }
                        }else if(this.status >= 400){
                            data = JSON.parse(this.responseText);
                            if (typeof options.error === "function") {
                                options.error(this.status, data);
                            }
                        }
                    }
                };    
            }

            if(options.method==='GET' || options.data == null){
                req.send();    
            }else{
                data = options.data;
                req.send(JSON.stringify(data));
            }
        };
        request.JSONP = function(options){

            var abortTimeout = null,
                callbackName = 'sjsonp' + new Date().getTime(),
                head = document.getElementsByTagName('head')[0],
                script = document.createElement('script'),
                xhr;
             
            options = options || {};
         
            xhr = {
              'abort': function abort() {
                  var _ref;
         
                  clearTimeout(abortTimeout);
         
                  if ((_ref = script.parentNode) !== null) {
                    _ref.removeChild(script);
                  }
         
                  if (callbackName in window) {
                    window[callbackName] = (function() {});
                  }
         
                }
            };
         
            window[callbackName] = function() {
                var args = arguments.length >= 1 ? Array.prototype.slice.call(arguments, 0) : [];
             
                clearTimeout(abortTimeout);
             
                script.parentNode.removeChild(script);
             
                try {
                    delete window[callbackName];
                } catch (e) {
                    window[callbackName] = null;
                }
             
                if (typeof options.success === "function") {
                    options.success(args[0][0],args[0][2]);
                }
         
            };
         
            options.data || (options.data = {});
         
            script.onerror = function (){
                var args = arguments.length >= 1 ? Array.prototype.slice.call(arguments, 0) : [];
                xhr.abort();
                if (typeof options.error === "function") {
                    options.error(500, {user_agent:window.navigator.userAgent});
                }
            };
         
            script.src = options.url+"&callback="+callbackName;
         
            head.appendChild(script);
         
            if (options.timeout > 0) {
              abortTimeout = setTimeout(function() { xhr.abort(); }, options.timeout);
            }
         
            return xhr;

        };
        return request;
    }();
}).call(this);


var getPixels = function(status, response) {
    if (status == 200 || 201) {
        var sessionId = response.id;
        Checkout.tokenId = sessionId;
        var createSwfObject = function(src, attributes, parameters) {
            var i, html, div, obj, attr = attributes || {}, param = parameters || {};
            attr.type = 'application/x-shockwave-flash';
            if (window.ActiveXObject) {
                attr.classid = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
                param.movie = src;
            }
            else {
                attr.data = src;
            }
            html = '<object';
            for (i in attr) {
                html += ' ' + i + '="' + attr[i] + '"';
            }
            html += '>';
            for (i in param) {
                html += '<param name="' + i + '" value="' + param[i] + '" />';
            }
            html += '</object>';
            div = document.createElement('div');
            div.innerHTML = html;
            obj = div.firstChild;
            div.removeChild(obj);
            return obj;
        };

        new Image().src = "https://content.mercadopago.com/fp/clear.png?org_id=jk96mpy0&session_id=" + sessionId + "&m=1";
        new Image().src = "https://content.mercadopago.com/fp/clear.png?org_id=jk96mpy0&session_id=" + sessionId + "&m=2";

        var newScript = document.createElement("script");
        newScript.type = "text/javascript";
        newScript.src = "https://content.mercadopago.com/fp/check.js?org_id=jk96mpy0&session_id=" + sessionId;
        document.body.appendChild(newScript);

        var swfEl = createSwfObject('https://content.mercadopago.com/fp/fp.swf?org_id=jk96mpy0&session_id=' + sessionId, {id: 'obj_id', width: 1, height: 1}, {movie: 'https://content.mercadopago.com/fp/fp.swf?org_id=jk96mpy0&session_id=' + sessionId});
        document.body.appendChild(swfEl);
    }
};
var trackPixels = function(){
    Checkout.createToken({}, getPixels);
    if(Checkout.getPaymentMethods().length===0){
        Checkout.getAllPaymentMethods();
    }
};
if(window.addEventListener) {
    window.addEventListener('load', trackPixels, false);
}else if (window.attachEvent) {
    window.attachEvent('onload', trackPixels);
}