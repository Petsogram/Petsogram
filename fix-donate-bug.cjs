const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'App.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

const oldHandleDonate = `  const handleDonate = () => {
    const finalAmount = custom ? parseInt(custom, 10) : amount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      toast.push("Please enter a valid donation amount.");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
      makeDonation(cat, finalAmount);
      
      notify({
        title: "Donation successful",
        message: \`Your ₹\${finalAmount} donation for \${cat} was recorded successfully.\`,
        type: "reward"
      });
      
      if (rewards && rewards.logActivity) {
        rewards.logActivity('donate_supplies'); // Hooking into existing reward logic
      }
      
      toast.push(\`Thank you! ₹\${finalAmount} donated toward \${cat}\`);
      setCustom("");
      setAmount(500);
      setIsProcessing(false);
    }, 800);
  };`;

const newHandleDonate = `  const handleDonate = async () => {
    const finalAmount = custom ? parseInt(custom, 10) : amount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      toast.push("Please enter a valid donation amount.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      makeDonation(cat, finalAmount);
      
      notify({
        title: "Donation successful",
        message: \`Your ₹\${finalAmount} donation for \${cat} was recorded successfully.\`,
        type: "reward"
      });
      
      if (rewards && rewards.submitForVerification) {
        rewards.submitForVerification('donate_supplies', \`DON-\${Date.now()}\`, "Monetary donation");
      }
      
      toast.push(\`Thank you! ₹\${finalAmount} donated toward \${cat}\`);
      setCustom("");
      setAmount(500);
    } catch (error) {
      console.error(error);
      toast.push("Donation could not be completed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };`;

if (destCode.includes(oldHandleDonate)) {
    destCode = destCode.replace(oldHandleDonate, newHandleDonate);
    fs.writeFileSync(destFile, destCode);
    console.log("Successfully fixed handleDonate in App.jsx");
} else {
    console.error("Could not find old handleDonate in App.jsx. Pattern mismatch.");
}
