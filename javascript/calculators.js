class Result {
    constructor(bankName, monthlyInstallment, fullSum) {
        this.bankName = bankName;
        this.monthlyInstallment = monthlyInstallment;
        this.fullSum = fullSum;
    }
}

class BankData {
    constructor(name) {
        this.name = name;
    }

    universalFormula(budget, interest, period) {
        return (budget * interest / 100 + budget) / period;
    }

    abstractCalculator(budget, interest, period) {
        let monthly = this.universalFormula(budget, interest, period);
        return new Result(this.name, monthly, monthly * period);
    }

    async loadFromAPI(api) {
        const url = proxy + encodeURIComponent(api);
        try {
            const response = await fetch(url);
            let jsonResp = await response.json();
            if (!jsonResp.status && jsonResp.status != undefined) {
                return jsonResp.errors;
            }
            return jsonResp;
        } catch (error) {
            console.error('Error during fetch:', error);
            return "";
        }
    }
}

class UBB extends BankData {
    async calculateLeasing(budget, period) {
        const resp = await fetch(proxy + `https://interlease.bg/en/leasing-calculator/submit?commission=&lease_type=4&range=${budget}&calc_start_fee=1&calc_period=${period}`);
        const data = await resp.json();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.html;

        const monthlyInstalmentRow = tempDiv.querySelector("table > tbody > tr:nth-child(3) > td:nth-child(2)").textContent
        const increaseValue = tempDiv.querySelector("table:nth-child(3) > tbody > tr:nth-child(1) > td:nth-child(2)").textContent;

        const monthlyInstallment = parseFloat((monthlyInstalmentRow.substring(0, monthlyInstalmentRow.indexOf("BGN"))).replace(" ", ""))
        const increase = parseFloat((increaseValue.substring(0, increaseValue.indexOf("BGN"))).replace(" ", ""))
        return new Result(this.name, monthlyInstallment, budget + increase);
    }

    async calculateLoan(budget, period) {
        let data = await super.loadFromAPI(`https://www.ubb.bg/loan_calculators/calculate?loan_id=3&currency_id=1&amount=${budget}&term_length=${period}&min_payroll_amount=2000`);
        console.log(data);
        return new Result(this.name, data.monthly_installment, data.monthly_installment * period);
    }

    calculateInvestment(budget, period) {
        return super.abstractCalculator(budget, 1.5, period);
    }

    calculateSavings(budget, period) {
        return super.abstractCalculator(budget, 0.15, period);
    }

    async calculateCredit(budget, period) {
        let data = await super.loadFromAPI(`https://www.ubb.bg/loan_calculators/calculate?loan_id=1&currency_id=1&amount=${budget}&term_length=${period}&min_payroll_amount=2000`);
        return new Result(this.name, data.monthly_installment, data.monthly_installment * period);
    }

    calculateStudent(budget, period) {
        return super.abstractCalculator(budget, 1.38, period);
    }
}

class Unicredit extends BankData {
    calculateLeasing(budget, period) {
        return super.abstractCalculator(budget, 1.0, period);
    }
    calculateLoan(budget, period) {
        return super.abstractCalculator(budget, 1.0, period);
    }
    calculateInvestment(budget, period) {
        return super.abstractCalculator(budget, 1.0, period);
    }
    calculateSavings(budget, period) {
        return super.abstractCalculator(budget, 1.0, period);
    }
    calculateCredit(budget, period) {
        return super.abstractCalculator(budget, 1.0, period);
    }
    calculateStudent(budget, period) {
        return super.abstractCalculator(budget, 1.0, period);
    }
}

class Dsk extends BankData {
    calculateLeasing(budget, period) {
        // leasing is for corporation
        return super.abstractCalculator(budget, 4.25, period);
    }

    calculateLoan(budget, period) {
        return super.abstractCalculator(budget, 3.725, period);
    }

    async calculateInvestment(budget, period) {
        // there is a bug with the api
        // in the UI you are limited to invest up to 1_000_000 BGN
        // but using the api you can go more than 40_000_000
        const url = `https://dskam.bg/funds-calculate?fundType=1&initialPayment=${budget}&periodicPayment=&numberOfPeriods=12&numberOfYears=${Math.ceil(period / 12)}`;
        let a = await super.loadFromAPI(url);


        let monthly = parseFloat(a.fullValue.replace(" ", "")) / period;

        return new Result(this.name, monthly, monthly * period);

    }

    calculateSavings(budget, period) {
        return super.abstractCalculator(budget, 0, period);
    }

    calculateCredit(budget, period) {
        return super.abstractCalculator(budget, 3.725, period);
    }

    calculateStudent(budget, period) {
        return super.abstractCalculator(budget, 1.4, period);
    }
}

class CustomBank extends BankData {
    calculateLeasing(budget, interest, period) {
        return super.abstractCalculator(budget, interest, period);
    }

    calculateLoan(budget, interest, period) {
        return super.abstractCalculator(budget, interest, period);
    }

    calculateInvestment(budget, interest, period) {
        return super.abstractCalculator(budget, interest, period);
    }

    calculateSavings(budget, interest, period) {
        return super.abstractCalculator(budget, interest, period)
    }

    calculateCredit(budget, interest, period) {
        return super.abstractCalculator(budget, interest, period)
    }

    calculateStudent(budget, interest, period) {
        return super.abstractCalculator(budget, interest, period)
    }
}

// used to get around CORS policies
const proxy = "https://corsproxy.io/?"

const banks = {
    "ubb": new UBB("ОББ"),
    "unicredit": new Unicredit("УниКредит"),
    "dsk": new Dsk("ДСК"),
    "custom": new CustomBank("От вашите данни")
};

export function autoCalculator() {

    $("#form").on("submit", async function (event) {
        event.preventDefault();
        let [budget, interest, period] = getDataFromSubmitEvent(event)

        let customData = banks.custom.calculateLeasing(budget, interest, period)
        let ubbData = await banks.ubb.calculateLeasing(budget, period)
        let unicreditData = banks.unicredit.calculateLeasing(budget, period)
        let dskData = banks.dsk.calculateLeasing(budget, period);

        loadResults(ubbData, unicreditData, dskData, customData)
    })
}

export function loanCalculator() {

    $("#form").on("submit", async function (event) {
        event.preventDefault();

        let [budget, interest, period] = getDataFromSubmitEvent(event)

        let customData = banks.custom.calculateLoan(budget, interest, period)
        let ubbData = await banks.ubb.calculateLoan(budget, period)
        let unicreditData = banks.unicredit.calculateLoan(budget, period)
        let dskData = banks.dsk.calculateLoan(budget, period);

        loadResults(ubbData, unicreditData, dskData, customData)
    })

}

export function investmentCalculator() {

    $("#form").on("submit", async function (event) {
        event.preventDefault();

        let [budget, interest, period] = getDataFromSubmitEvent(event);

        let customData = banks.custom.calculateInvestment(budget, interest, period);
        let ubbData = banks.ubb.calculateInvestment(budget, period);
        let unicreditData = banks.unicredit.calculateInvestment(budget, period);
        let dskData = await banks.dsk.calculateInvestment(budget, period)

        loadResults(ubbData, unicreditData, dskData, customData)

    })

}

export function savingsCalculator() {

    $("#form").on("submit", async function (event) {
        event.preventDefault();

        let [budget, interest, period] = getDataFromSubmitEvent(event)
        let customData = banks.custom.calculateSavings(budget, interest, period)
        let ubbData = banks.ubb.calculateSavings(budget, period);
        let unicreditData = banks.unicredit.calculateSavings(budget, period)
        let dskData = banks.dsk.calculateSavings(budget, period)
        loadResults(ubbData, unicreditData, dskData, customData)
    })

}

export function creditCalculator() {

    $("#form").on("submit", async function (event) {
        event.preventDefault();

        let [budget, interest, period] = getDataFromSubmitEvent(event)
        let customData = banks.custom.calculateCredit(budget, interest, period)
        let ubbData = await banks.ubb.calculateCredit(budget, period);
        let unicreditData = banks.unicredit.calculateCredit(budget, period)
        let dskData = banks.dsk.calculateCredit(budget, period)

        loadResults(ubbData, unicreditData, dskData, customData)
    })


}

export function studentCalculator() {

    $("#form").on("submit", async function (event) {
        event.preventDefault();

        let [budget, interest, period] = getDataFromSubmitEvent(event)
        let customData = banks.custom.calculateStudent(budget, interest, period)
        let ubbData = banks.ubb.calculateStudent(budget, period);
        let unicreditData = banks.unicredit.calculateStudent(budget, period)
        let dskData = banks.dsk.calculateStudent(budget, period)

        loadResults(ubbData, unicreditData, dskData, customData)
    })

}

function loadResults(ubbData, unicreditData, dskData, customMonthlyPayment) {
    let results = document.getElementById("results");
    results.style.display = "flex";

    document.getElementById("ubb").innerHTML = populateCardBody(ubbData);
    document.getElementById("dsk").innerHTML = populateCardBody(dskData);
    document.getElementById("custom").innerHTML = populateCardBody(customMonthlyPayment);
    document.getElementById("unicredit").innerHTML = populateCardBody(unicreditData);

    results.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function populateCardBody(result) {
    return `<h5 class="card-title">${result.bankName}</h5>
    ${getMessageBasedResultType(result)}`
}

function getDataFromSubmitEvent(event) {
    let formData = new FormData(event.target);
    return [Number(formData.get("budget")), Number(formData.get("interest")), Number(formData.get("period"))];
}

function getMessageBasedResultType(result) {
    const errorMessage = `<p class="card-text" >Има грешка при изчисляване/взимане на данните за банката.
    Това може да е в резултат на избрани твърде големи сума и/или срок.
    Моля, пробвайте с други данни и ако проблемът продължава, съобщете за него.</p>`

    if (isNaN(result.monthlyInstallment) || result.monthlyInstallment == null) {
        return errorMessage
    }
    return `<p class="card-text monthly-installment" >Месечна вноска: ${parseFloat(result.monthlyInstallment).toFixed(2)}</p>
    <p class="card-text full-sum">Крайна сума (с лихва): ${parseFloat(result.fullSum).toFixed(2)}</p>`
}