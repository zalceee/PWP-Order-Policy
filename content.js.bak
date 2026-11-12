
const TARGET_ALUS = new Set([
    "1000018795001"
]);

const REQUIRED_COMMENT = "CTBGWP";

let savedComment1 = "";
let lastValidationState = "";


/*
============================================================
GET TRANSACTION AREA
============================================================
*/

function getTransactionArea() {
    return (
        document.getElementById("transactionItems") ||
        document.getElementById("searchTransactionItemsResultList") ||
        document.body
    );
}


/*
============================================================
TARGET ALU
============================================================
*/

function hasTargetALU() {

    const text = getTransactionArea().innerText || "";

    for (const alu of TARGET_ALUS) {
        if (new RegExp("\\b" + alu + "\\b").test(text)) {
            return true;
        }
    }

    return false;
}


/*
============================================================
CHECK DISCOUNT
============================================================
*/

function hasDiscount() {

    const text = getTransactionArea()
        .innerText
        .replace(/\s+/g, " ");

    const discountLabels = [
        /Disc\s*%/gi,
        /Disc(?:ount)?\s*Amt/gi
    ];

    for (const regex of discountLabels) {

        let match;

        while ((match = regex.exec(text)) !== null) {

            const remaining = text.substring(regex.lastIndex);

            const valueMatch = remaining.match(
                /^\s*[:：]?\s*[₱$]?\s*(-?[\d,]+(?:\.\d+)?)/ 
            );

            if (!valueMatch) continue;

            const value = parseFloat(
                valueMatch[1].replace(/,/g, "")
            );

            if (value > 0) {
                return true;
            }
        }
    }

    return false;
}


/*
============================================================
COMMENT1 - PRESERVE ORIGINAL LOGIC
============================================================
*/

function getComment1() {

    const input = document.getElementById("comment1");
    const totalInput = document.getElementById("documentTotal");

    if (
        totalInput &&
        totalInput.value.trim().startsWith("-")
    ) {
        savedComment1 = REQUIRED_COMMENT;

    } else if (input) {

        savedComment1 = input.value.trim().toUpperCase();
    }

    return savedComment1;
}


/*
============================================================
UPDATE TENDER BUTTON
============================================================
*/

function updateTenderButton() {

    const tenderButton = document.getElementById("tenderbutton");

    if (!tenderButton) return;

    // Normal transactions: no additional restrictions.
    if (!hasTargetALU()) {

        savedComment1 = "";
        lastValidationState = "";

        tenderButton.disabled = false;
        tenderButton.style.pointerEvents = "";
        tenderButton.style.opacity = "";
        tenderButton.title = "";

        return;
    }

    const discountDetected = hasDiscount();
    const comment1 = getComment1();

    const validDiscount = !discountDetected;
    const validComment = comment1 === REQUIRED_COMMENT;

    const disable = !(validDiscount && validComment);

    const state = JSON.stringify({
        discountDetected,
        validComment,
        disable
    });

    if (
        lastValidationState === state &&
        tenderButton.disabled === disable
    ) {
        return;
    }

    lastValidationState = state;

    tenderButton.disabled = disable;

    tenderButton.style.pointerEvents =
        disable ? "none" : "";

    tenderButton.style.opacity =
        disable ? "0.5" : "";

    if (disable) {

        if (!validDiscount && !validComment) {

            tenderButton.title =
                "Discount is not allowed and Comment1 must be CTBGWP.";

        } else if (!validDiscount) {

            tenderButton.title =
                "Discount detected. Remove discount before Tender.";

        } else {

            tenderButton.title =
                "Comment1 must be CTBGWP before Tender.";
        }

    } else {

        tenderButton.title = "";
    }
}


/*
============================================================
PREVENT TENDER CLICK
============================================================
*/

document.addEventListener("click", function(e) {

    const button = e.target.closest("#tenderbutton");

    if (!button) return;

    if (!hasTargetALU()) return;

    const discountDetected = hasDiscount();
    const validComment = getComment1() === REQUIRED_COMMENT;

    if (discountDetected || !validComment) {

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        updateTenderButton();

        console.warn("Tender blocked:", {
            discountDetected,
            comment1: savedComment1,
            validComment
        });
    }

}, true);


/*
============================================================
MONITOR COMMENT1 INPUT
============================================================
*/

document.addEventListener("input", function(e) {

    if (e.target && e.target.id === "comment1") {

        const totalInput = document.getElementById("documentTotal");

        if (
            !totalInput ||
            !totalInput.value.trim().startsWith("-")
        ) {
            savedComment1 = e.target.value.trim().toUpperCase();
        }

        updateTenderButton();
    }

}, true);

document.addEventListener("change", function(e) {

    if (e.target && e.target.id === "comment1") {
        updateTenderButton();
    }

}, true);


/*
============================================================
MONITOR TRANSACTION CHANGES
============================================================
*/

const observer = new MutationObserver(() => {
    updateTenderButton();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});


/*
============================================================
INITIAL CHECK
============================================================
*/

updateTenderButton();

setInterval(updateTenderButton, 500);
