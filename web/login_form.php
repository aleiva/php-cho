<?php
	session_start();

    //Poner en session los datos del item. Por simplicidad, solo colocamos el monto.
    $_SESSION['amount'] = 20;
?>

<form action="full_form.php" method="post" name="login">
    <h1>Monto a pagar <?php echo $_SESSION['amount'] ?></h1>
    <h3>Log in to pay!</h3>
    <div class="column">   
        <label class="card-label" for="email">
	  		<input type="email" id="email" name="email" placeholder="Email" class="card-field"/>
        </label>
     </div>

     <div class="column">   
         <p><input type="submit" value="Next" class="demoSubmit"/></p>
     </div>
</form>

<script type="text/javascript">

jQuery(function($) {
    $("form[name=login]").submit(function (event) {
        if($("#email").val()==""){
            showError($('label[for="email"]'));
            return false;
        }
    });
});
</script>