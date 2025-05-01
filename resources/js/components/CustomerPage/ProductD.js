import React from 'react';


const ProductD = ({ description }) => {
  // Default values in case parsing fails
  let intro = description || 'No description available.';
  let features = [];
  let careInstructions = [];

  // Parse the description if it follows the expected format
  if (description && typeof description === 'string') {
    // Split the description into sections based on headings
    const sections = description.split(/(Features:|Care Instructions:)/);
    
    if (sections.length > 1) {
      // First part is the intro (before "Features:")
      intro = sections[0].trim();

      // Parse features if "Features:" section exists
      const featuresIndex = sections.indexOf('Features:');
      if (featuresIndex !== -1 && featuresIndex + 1 < sections.length) {
        let featuresText = sections[featuresIndex + 1];
        // If "Care Instructions:" follows, limit the features text
        const careIndex = sections.indexOf('Care Instructions:', featuresIndex);
        if (careIndex !== -1) {
          featuresText = sections[featuresIndex + 1].substring(0, sections[careIndex].length);
        }
        // Extract bullet points (assuming they start with "- ")
        features = featuresText
          .split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => line.replace('- ', '').trim())
          .filter(line => line.length > 0);
      }

      // Parse care instructions if "Care Instructions:" section exists
      const careIndex = sections.indexOf('Care Instructions:');
      if (careIndex !== -1 && careIndex + 1 < sections.length) {
        const careText = sections[careIndex + 1];
        // Extract bullet points
        careInstructions = careText
          .split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => line.replace('- ', '').trim())
          .filter(line => line.length > 0);
      }
    }
  }

  return (
    <div className="product-description">
      <h2 className="product-description__title">Product Description</h2>
      <div className="product-description__content">
        <p className="product-description__intro">{intro}</p>
        {features.length > 0 && (
          <>
            <h3 className="product-description__subtitle">Features:</h3>
            <ul className="product-description__list">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </>
        )}
        {careInstructions.length > 0 && (
          <>
            <h3 className="product-description__subtitle">Care Instructions:</h3>
            <ul className="product-description__list">
              {careInstructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductD;