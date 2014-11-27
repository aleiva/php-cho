<?php
  session_start();
  require_once('./header.php');
  require_once('./apidb.php');

  if ($_POST) {
    $error = NULL;
    $card_token = $_POST['card'];
    $amount = $_SESSION['amount']; 
    $installments = $_POST['installments'];
    $card_id = $_POST['cardId'];
    $issuer = $_POST['issuersOptions'];
    $external_reference = "PHP sample";
    $payer_email = $_SESSION['payer_email'];

    if(!$installments){
        $installments = 1;
    }
    else{
        $installments = intval($installments);
    }

    $body = array();
    $body['amount'] = $amount;
    $body['installments'] = $installments;
    $body['card'] = $card_token;
    $body['external_reference'] = $external_reference;
    $body['reason'] = 'test';


    if (isset($_SESSION['customer_id'])){
      $body['customer'] = $_SESSION['customer_id'];
    }
    else{
      $body['payer_email'] =$payer_email;
    }

    if(isset($_POST['issuersOptions']) && $issuer<>-1){
      $body['card_issuer_id'] =intval($issuer);
    }


    try {

      $payment = create_payment_mp($body);

      if (isset($_SESSION['customer_id'])){
          //Agregar tarjeta al usuario ya creado
          customer_add_card($_SESSION['customer_id'], $card_token);
      }
      else{
          //Crear el customer en MP. 
          $customer = create_mp_customer($payer_email, $card_token);      
      }

    }
    catch (Exception $e) {
      $error = $e->getMessage();
    }

    if ($error == NULL) {
      echo '<pre>';
      print_r($payment);
      echo '</pre>';
      echo "<h1>Payment status: $payment->status </h1>";
      echo "<h2>Payment id: $payment->payment_id </h2>";

    }
    else {
      echo "<div class=\"error\">".$error."</div>";
      require_once('./index.php');
    }
  }
  session_destroy();
  require_once('./footer.php');
?>