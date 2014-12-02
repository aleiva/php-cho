<?php
  require_once('../sdk/meli.php');

  $meli = new Meli('7929281084187786', 'zgO0UhRBSnDRYLq0M8emV62s7VUw62Vu');
  $response = $meli->getAccessToken();
  $params = array('access_token' => $response['body']->access_token);


  $body = array();
  $body['amount'] = 2.0;
  $body['card'] = $_POST['card_token'];
  $body['payer_email'] ='test@mp.com';

  //Deberiamos hacer esto opcional
  $body['reason'] = 'PHP reason';
  $body['installments'] = 1;


  $payment = $meli->post('/checkout/custom/beta/create_payment', $body, $params);

  echo $payment["body"]->payment_id;
  

?>