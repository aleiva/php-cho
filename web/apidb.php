<?php

function get_customer($email_address)
{

    $meli = new Meli('7929281084187786', 'zgO0UhRBSnDRYLq0M8emV62s7VUw62Vu');

    $response = $meli->getAccessToken();

    //echo "https://api.mercadolibre.com/customers/search?email=".$email_address."&access_token=".$response['body']->access_token;

    $params = array('email' => $email_address,'access_token' => $response['body']->access_token);

    $customers = $meli->get('/customers/search', $params);


    $customer = $customers["body"];

    return $customer->results["0"];
}

//TODO, card token id puede ser null. Ver los parámetros
function create_mp_customer($email_address, $card_token_id=null)
{
    $meli = new Meli('7929281084187786', 'zgO0UhRBSnDRYLq0M8emV62s7VUw62Vu');

    $response = $meli->getAccessToken();

    $params = array('access_token' => $response['body']->access_token);

    $body = array('email' => $email_address, 'card' => $card_token_id);


    $customer = $meli->post('/customers', $body, $params);


    return $customer["body"];
}

function customer_add_card($customer_id, $card_token_id){
    $meli = new Meli('7929281084187786', 'zgO0UhRBSnDRYLq0M8emV62s7VUw62Vu');

    $response = $meli->getAccessToken();

    $params = array('access_token' => $response['body']->access_token);

    $body = array('card' => $card_token_id);


    $cards = $meli->post('/customers/'.$customer_id.'/cards', $body, $params);


    return $cards["body"];
}

function create_payment_mp($body)
{

    $meli = new Meli('7929281084187786', 'zgO0UhRBSnDRYLq0M8emV62s7VUw62Vu');

    $response = $meli->getAccessToken();

    $params = array('access_token' => $response['body']->access_token);


    $payment = $meli->post('/checkout/custom/beta/create_payment', $body, $params);


    return $payment["body"];
}

?>