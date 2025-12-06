// 🏠 נתוני תשואת שכירות עדכניים (מה שסיפקת)
const RENTAL_YIELDS = {
    "דימונה": 4.50,
    "קרית שמונה": 4.00,
    "אשדוד": 3.60,
    "אילת": 3.50,
    "באר שבע / אשקלון": 3.50,
    "עוטף עזה": 3.50,
    "עפולה / מגדל העמק / נצרת": 3.50,
    "לוד / רמלה": 3.00,
    "קריות": 3.00,
    "חיפה": 2.80,
    "רחובות": 2.50,
    "נתניה": 2.40,
    "כפר סבא / רעננה": 2.30,
    "ירושלים": 2.20,
    "בית שמש": 2.20,
    "בני ברק": 2.20,
    "בת ים": 2.20,
    "רמת השרון": 2.20,
    "נס ציונה": 2.10,
    "גבעתיים / רמת גן": 2.10,
    "תל אביב": 2.00
};

// פונקציה למילוי ה-Dropdown של הערים
function populateCities() {
    const select = document.getElementById('city');
    for (const city in RENTAL_YIELDS) {
        const option = document.createElement('option');
        option.value = RENTAL_YIELDS[city]; // הערך יהיה אחוז התשואה
        option.textContent = `${city} (${RENTAL_YIELDS[city]}% תשואת שכירות)`;
        select.appendChild(option);
    }
}

// קורא לפונקציה כדי למלא את הערים מיד לאחר טעינת הסקריפט
populateCities();

// 🔢 פונקציית החישוב הראשית
function calculateInvestment() {
    // --- קריאת נתונים מהקלט ---
    const initialCapital = parseFloat(document.getElementById('initialCapital').value);
    const investmentYears = parseInt(document.getElementById('investmentYears').value);
    const taxRate = parseFloat(document.getElementById('taxRate').value) / 100; // 0.25
    
    // מדדים
    const spReturn = parseFloat(document.getElementById('spReturn').value) / 100; // 0.10
    const nasdaqReturn = parseFloat(document.getElementById('nasdaqReturn').value) / 100; // 0.16

    // נדל"ן
    const annualRentYield = parseFloat(document.getElementById('city').value) / 100; // תשואת שכירות
    const priceAppreciation = parseFloat(document.getElementById('priceAppreciation').value) / 100; // 0.04
    const leverage = parseFloat(document.getElementById('leverage').value); // 4
    const closingCosts = parseFloat(document.getElementById('closingCosts').value); // 35000

    // בדיקות תקינות קלט בסיסיות
    if (isNaN(initialCapital) || isNaN(investmentYears) || initialCapital <= 0 || investmentYears <= 0) {
        alert("אנא הכנס הון התחלתי חיובי ומספר שנים חיובי.");
        return;
    }

    // ----------------------------------
    // 📊 חישוב השקעה במדדים (S&P ו-Nasdaq)
    // ----------------------------------

    // נוסחה: FV = P * (1 + r)^n
    // שווי סופי לפני מס
    const spFinalValue_preTax = initialCapital * Math.pow(1 + spReturn, investmentYears);
    const nasdaqFinalValue_preTax = initialCapital * Math.pow(1 + nasdaqReturn, investmentYears);

    // חישוב מס: (רווח * שיעור המס)
    const spGain = spFinalValue_preTax - initialCapital;
    const nasdaqGain = nasdaqFinalValue_preTax - initialCapital;
    
    // שווי סופי אחרי מס: הון התחלתי + (רווח * (1 - שיעור המס))
    const spFinalValue_postTax = initialCapital + (spGain * (1 - taxRate));
    const nasdaqFinalValue_postTax = initialCapital + (nasdaqGain * (1 - taxRate));


    // ----------------------------------
    // 🏠 חישוב השקעה בנדל"ן
    // ----------------------------------

    // 1. קביעת שווי הנכס ההתחלתי (ההון הממונף)
    const propertyValue_initial = initialCapital * leverage; // לדוגמא: 200k * 4 = 800k
    
    // 2. עלויות ההקמה
    const totalInvestedCapital = initialCapital + closingCosts; // לדוגמא: 200k + 35k = 235k

    // 3. החוב ההתחלתי (משכנתא)
    const initialDebt = propertyValue_initial - initialCapital; // לדוגמא: 800k - 200k = 600k

    // 4. חישוב ההכנסה משכירות (הנחה: מכסה משכנתא + שליש הולך לכיסוי חוב)
    // תשואה שנתית = שכר דירה שנתי / שווי נכס התחלתי
    // שכר דירה שנתי = שווי נכס התחלתי * תשואת שכירות
    const annualRentalIncome_initial = propertyValue_initial * annualRentYield; 
    
    // החישוב מתבסס על ההנחה שרק שליש מהשכירות הולך לכיסוי חוב, והיתר (שכר דירה - החזר חוב) נעלם/מכסה הוצאות שוטפות.
    // מכיוון שיש הנחה ש"שכר דירה מכסה משכנתא", אנו מתמקדים בהפחתת החוב.
    
    // חישוב שנתי: כמה מהחוב יורד כל שנה
    // *אנו מפשטים את הריבית על ההלוואה (משכנתא)* ומחשבים רק את ירידת החוב.
    const annualDebtReduction = (annualRentalIncome_initial / 12) * 12 * (1 / 3); // (שכירות חודשית * 12) * שליש

    // 5. חישוב שווי הנכס הסופי (עליית מחיר)
    const propertyValue_final = propertyValue_initial * Math.pow(1 + priceAppreciation, investmentYears);

    // 6. חישוב החוב הסופי (לאחר הפחתה)
    const totalDebtReductionOverTime = annualDebtReduction * investmentYears;
    const finalDebt = Math.max(0, initialDebt - totalDebtReductionOverTime); // החוב לא יכול להיות שלילי

    // 7. שווי הנקי הסופי (Net Equity) לפני מס
    // שווי נכס סופי - חוב סופי - הון שהושקע *מעבר* להון ההתחלתי (הוצאות נלוות)
    const realEstateFinalValue_preTax = propertyValue_final - finalDebt;
    
    // 8. חישוב רווח נדל"ן לצורך מס
    // רווח = שווי סופי לפני מס - הון שהושקע בפועל
    const realEstateGain = realEstateFinalValue_preTax - totalInvestedCapital;

    // 9. שווי נקי סופי (Net Equity) אחרי מס (מס רק על הרווח)
    const realEstateFinalValue_postTax = totalInvestedCapital + (realEstateGain * (1 - taxRate));


    // ----------------------------------
    // 📝 הצגת התוצאות
    // ----------------------------------
    // --- Nasdaq ---
    // לפני מס
    document.getElementById('nasdaqPreTax').textContent = formatCurrency(nasdaqFinalValue_preTax);
    // אחרי מס
    document.getElementById('nasdaqResult').textContent = formatCurrency(nasdaqFinalValue_postTax);
    
    // --- S&P 500 ---
    // לפני מס
    document.getElementById('spPreTax').textContent = formatCurrency(spFinalValue_preTax);
    // אחרי מס
    document.getElementById('spResult').textContent = formatCurrency(spFinalValue_postTax);
    
    // --- נדל"ן ---
    // לפני מס
    document.getElementById('realEstatePreTax').textContent = formatCurrency(realEstateFinalValue_preTax);
    // אחרי מס
    document.getElementById('realEstateResult').textContent = formatCurrency(realEstateFinalValue_postTax);
}

// פונקציית עזר לעיצוב מטבע
function formatCurrency(number) {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0 }).format(number);
}
