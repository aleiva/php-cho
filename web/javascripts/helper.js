//Manage Errors
function showError(atributte) {
	atributte.addClass("invalid");
}
function hideError(atributte) {
	atributte.removeClass("invalid");
}
function checkAndActiveError(errorCode) {
	var hasError = false;
	if ((errorCode !== null && (errorCode === "E301" || errorCode === "205"))) {
		showError($('label[for="ccNumber"]'));
		hasError = true;
	}
	if ((errorCode !== null && (errorCode === "E302" || errorCode === "224"))) {
		showError($('label[for="cvv"]'));
		hasError = true;
	}
	if ((errorCode !== null && errorCode === "221")) {
		showError($('label[for="cardholderName"]'));
		hasError = true;
	}
	if ((errorCode !== null && (errorCode === "324" || errorCode === "214"))) {
		showError($('label[for="docNumber"]'));
		hasError = true;
	}
	if ((errorCode !== null && (errorCode === "208" || errorCode === "209" || errorCode === "325" || errorCode === "326" || errorCode == "301"))) {
		showError($('label[for="expiration"]'));
		hasError = true;
	}
	return hasError;
}