<?php
session_start();
require_once('./header.php');
require_once('./apidb.php');

if ($_POST) {
    $email             = $_POST['email'];
    $existing_customer = get_customer($_POST['email']);
      
    $_SESSION['payer_email'] = $email;


    if($existing_customer){
      $_SESSION['customer_id'] = $existing_customer->id;
    }

?>
    <link rel="stylesheet" type="text/css" href="./stylesheets/payment-methods.css"/>

    <!-- JS-SDK -->
    <script type="text/javascript" src="./javascripts/checkout.js"></script>
    <script src="./javascripts/payment.js"></script>
    <h1>Monto a pagar <?php echo $_SESSION['amount'] ?></h1>


      <form action="charge.php" method="POST" id="pay">
        <div id="fullForm" class="column"> 

        <?php
                foreach ($existing_customer->cards as $c) {
                    $options[] = "<option value='{$c->id}' type='{$c->payment_method->payment_type_id}' pmethod='{$c->payment_method->id}' first_six_digits='{$c->first_six_digits}' binId='{$c->last_four_digits}' issuerId='{$c->issuer->id}'>{$c->payment_method->id} {$c->last_four_digits}</option>";
                }
                $options[] = "<option value='-1'>Otra tarjeta</option>";

?>

            <label class="card-label hidden" for="cardId">
              <select id="cardId" name="cardId" data-checkout='cardId' class="card-field">
                <?php
                  echo implode("\n", $options);
                ?>
              </select> 
            </label>

        <div>
            <label class="card-label credit-card-number-label" for="ccNumber">
                    <span class="field-name">Card Number</span>
                <input  data-checkout="cardNumber" type="text" placeholder="Card Number" class="card-field" />
            </label>
          
        </div>
         <div>
            <label class="card-label expiration-label right-border show-label" for="expiration">
                        <span class="field-name">MM / YYYY</span>
                <input data-checkout="cardExpiration" placeholder="Expiration Date" type="text" class="card-field" />
            </label>
        </div>
        <div>

            <label class="card-label cvv-label" for="cvv">
                        <span class="field-name">CVV</span>
                 <input data-checkout="securityCode"  placeholder="CVV" type="text" class="card-field"/>
            </label>
        </div>    
        <p id="issuersField" class="hidden">
            <label class="card-label" for="issuersOptions">
                <select id="issuersOptions" name="issuersOptions" class="card-field">
                </select>
            </label>
        </p>
        <p id="installmentsOption" class="hidden">
            <select id="installments" name="installments" class="card-field">
            </select>
        </p>

         <div>
           <label class="card-label" for="cardholderName">
                        <span class="field-name">Card Holder Name</span>
                <input data-checkout="cardholderName" placeholder="Cardholder name" type="text" class="card-field" />
            </label>
        </div>
        <div>
            <label class="card-label hidden" for="docType">
                <span id="docType" class="card-field "></span>
            </label>    
            <!--label class="card-label hidden" for="subDocType">
                <span id="subDocType"></span>
            </label-->
            <label class="card-label" for="docNumber">
                <input data-checkout="docNumber" placeholder="Identification Number" type="text" class="card-field"/>
            <label>
        </div>


         <div class="l-centralized l-row-mini">
            <button id="doPayment" title="Pay" class="demoSubmit">Pagar</button>
        </div>


      </form>
    </div>
      <br>


<script type="text/javascript">
    var doSubmit = false;
    var amount = <?php echo $_SESSION['amount'] ?>;
    //Reemplazar con id del pais
    var siteId = "mla";
    var fullData = ["cardholderName","ccNumber","expiration","cvv","docType","subDocType","docNumber","issuersOptions"];

    //Reemplazar con tu public key.
    Checkout.setPublishableKey("841d020b-1077-4742-ad55-7888a0f5aefa");

    var _submit = function(event){

        event.preventDefault();

        if($("#installments").val()=="-1"){
                alert("missing installments");
                return false;
        }
        if(!doSubmit){
            var $form = document.querySelector("#pay");
            
            Checkout.createToken($form, sdkResponseHandler);

            return false;
        }
    };
    
    if(document.addEventListener) {
        document.querySelector("#pay").addEventListener("submit", _submit);
    }else if (document.attachEvent) {
        document.querySelector("#pay").attachEvent("submit", _submit);
    }

    var sdkResponseHandler = function(status, response) {
        
        var $form = $("#pay");

        if (status != 200 && status != 201) {
           
            for (index = 0;response.cause && index < response.cause.length; index++) {
                if (response.cause[index] != null) {
                    checkAndActiveError(response.cause[index].code);
                }
            }
        }else{
            
            $form.append($('<input type="hidden" id="card" name="card"/>').val(response.id));
            doSubmit=true;
            $form.submit();
        }
    };

    jQuery(function($) {


        $('input[data-checkout="cardNumber"]').payment('formatCardNumber');
        $('input[data-checkout="cardExpiration"]').payment('formatCardExpiry');
        $('input[data-checkout="securityCode"]').payment('formatCardCVC');

      
        // SETEO DE DOC TYPES Y DOC NUMBER

        var docTypes = Checkout.getDocTypes(siteId.toUpperCase());

        if(docTypes){
            var options ="<select data-checkout='docType' class='card-field'>";
            $.each(docTypes, function(index, value) {
                options += "<option value='"+ value.id +"' class='card-field'>"+ value.name + "</option>";
            });
            options+="</select>";
            $("#docType").html($("#docType").html()+options);

            $("label[for=docType]").removeClass("hidden");
        }

        var subDocTypes = Checkout.getSubDocTypes(siteId.toUpperCase());

        if(subDocTypes){
            var options ="<select data-checkout='subDocType' class='card-field'>";

            $.each(subDocTypes[docTypes[0].id], function(index, value) {
                options += "<option value='"+ value +"' class='card-field'>"+ value+ "</option>";
            });
            options+="</select>";
            $("#subDocType").html($("#subDocType").html()+options);

            $("label[for=subDocType]").removeClass("hidden");

            $("select[data-checkout='docType']").bind("change",function(){
                options ="";
                $.each(subDocTypes[$(this).val()], function(index, value) {
                        options += "<option value='"+ value +"'>"+ value+ "</option>";
                    });
                $("select[data-checkout='subDocType']").html(options);
            });
        }

        // MANEJO DE COMBO DE TC
        $("select[data-checkout='cardId']").bind("change",function(){
            $("#issuersField,#installmentsOption").hide();
            if($(this).val()!="-1"){
                $.each(fullData,function(index,value){
                    $("label[for='"+value+"']").addClass("hidden");
                });
                $("label[for='cardId']").removeClass("hidden");
                 $("label[for='cvv']").removeClass("hidden");

                Checkout.getPaymentMethod($("select[data-checkout='cardId'] option:selected").attr("first_six_digits"),setPaymentMethodInfo);
                
            }else{
                 
                //$("#rememberCard").removeClass("hidden");
                $.each(fullData,function(index,value){
                    $("label[for='"+value+"']").removeClass("hidden");
                   });
            }
        });

        //if(cards.length>0){
        if (<?php echo count($existing_customer->cards) ?> > 0){
            $("label[for='cardId']").removeClass("hidden");
            $("select[data-checkout='cardId']").change();
        }
    
        

        $(".card-label").bind("change", function(){
            hideError($(this));
        });

        $('input[data-checkout="cardNumber"]').on("keyup paste",function(e){
                var bin;
                if(e.type == "keyup"){
                     bin = getBin();
                     if (bin.length == 6){
                        Checkout.getPaymentMethod(bin,setPaymentMethodInfo);
                     }
                }else{
                    setTimeout(function () {
                        bin = getBin();
                        if (bin.length >= 6){
                            Checkout.getPaymentMethod(bin,setPaymentMethodInfo);
                        }
                    },100);
                }
            });

        // OBTENER LAS INSTALLMENTS SEGUN EL ISSUER

        $("#issuersOptions").change(function(){
           
            Checkout.getInstallmentsByIssuerId(getBin(),this.value,parseFloat(amount),setInstallmentInfo);
        });

    });

    function getBin(){

        var bin;
        if($("input[data-checkout='cardNumber']").is(":visible")){
            bin = $("input[data-checkout='cardNumber']").val().replace(/ /g, '').replace(/-/g, '').replace(/\./g, '').slice(0,6);
        }else {
            bin = $("select[data-checkout='cardId'] option:selected").attr("first_six_digits");
        }
        return bin;
    }

    //Sets the data for the choosen payment method
    function setPaymentMethodInfo(status, result){
        $.each(result, function(p, r){
            Checkout.getInstallments(getBin() ,parseFloat(amount), function(status, installments){
                    
                    setInstallmentInfo(status, installments);

                    Checkout.getCustomizedCardIssuers(getBin(),function(status, issuers){
                            
                            showCustomizedCardIssuers(status, issuers);
                            if($("#issuersOptions").is(":visible")){
                                $("#issuersOptions").val(r.card_issuer.id);   
                            }
                    });
             });
        });
    };

    //It places the available installment plans in the 'installmentsOption' div
    function setInstallmentInfo(status, installments){
        var html_options = "<option value='-1'>Elige...</option>";
        for(i=0; installments && i<installments.length; i++){
            html_options += "<option value='"+installments[i].installments+"'>"+installments[i].installments + (installments[i].installments == 1 ?" cuota":" cuotas")+" de "+installments[i].share_amount+" ("+installments[i].total_amount+")</option>";
        };
        
        $("#installments").html(html_options);
        $("#installmentsOption").show();
    };


// COMBO customizado de cuotas

    function showCustomizedCardIssuers(status, issuers){
        var i,options="<option value='-1'>Elige...</option>";
        var installmentPromotionsMsg = "¡Hasta xx cuotas sin interés!";
        if(status!=200){
            $("#issuersOptions").html("");
            $("#issuersField").hide();
            return
        }
        var banksListOpt = {} , optionsBank, defaultIssuer;
        $.each(issuers, function(index, value) {

            if(value.name!='default'){
                optionsBank = "<option value='"+ value.id +"'>"+ value.name + "</option>";
                i = value.promotions.max_installments ? value.promotions.max_installments  : 0;
                banksListOpt[i] = banksListOpt[i] ? banksListOpt[i] : "";
                banksListOpt[i] += optionsBank;
            }else{
                defaultIssuer = value;
            } 
            
        });
                
            
        banksListOpt[0] = banksListOpt[0] ? banksListOpt[0] : "";
        banksListOpt[0] += "<option value='"+ defaultIssuer.id +"' default='"+ defaultIssuer.id +"'>Cualquier otro banco</option>";
        
        var keys = Object.keys(banksListOpt).sort(function(a,b){return b-a;});
        for (i=0; i < keys.length; i++)
        {
           if(Object.keys(issuers).length == 1)
                options += banksListOpt[keys[i]];
            else if (keys[i] == 0){
                if(keys.length>1){
                    options += "<optgroup name='othBank' label='Otro banco'>"+banksListOpt[keys[i]]+"</optgroup>";
                }else{
                    options += banksListOpt[keys[i]];
                }
            }else{
                options += "<optgroup label='"+ installmentPromotionsMsg.replace("xx", keys[i]).replace("!","").replace("¡","") +"'>"+banksListOpt[keys[i]]+"</optgroup>" ;
            }
        }

        if(issuers.length>1){
            $("#issuersField").show();
            $("#issuersOptions").html(options);
        }else{
            $("#issuersOptions").html("");
            $("#issuersField").hide();
        }
    };
    
</script>

  <?php
    require_once('./footer.php');
}
?>