const rtlSupport = (req, res, next) => {
  // Get language from query parameter, header, or default to 'en'
  const language =
    req.query.lang ||
    req.headers["accept-language"]?.split(",")[0]?.split("-")[0] ||
    "en";

  // Determine if the language is RTL
  const rtlLanguages = ["ar", "he", "fa", "ur", "ku", "dv"];
  const isRTL = rtlLanguages.includes(language.toLowerCase());

  // Add language and direction info to request
  req.language = language;
  req.isRTL = isRTL;
  req.direction = isRTL ? "rtl" : "ltr";

  // Add helper function to response locals
  res.locals.getLocalizedField = (field, fieldAr) => {
    return isRTL ? fieldAr : field;
  };

  res.locals.getLocalizedFields = (obj) => {
    const result = {};
    Object.keys(obj).forEach((key) => {
      if (key.endsWith("Ar") && isRTL) {
        const baseKey = key.slice(0, -2);
        result[baseKey] = obj[key];
      } else if (!key.endsWith("Ar")) {
        result[key] = obj[key];
      }
    });
    return result;
  };

  next();
};

// Helper function to format response with RTL/LTR support
const formatResponse = (data, req) => {
  if (!data) return data;

  const { isRTL } = req;

  // Recursively process objects and arrays
  // Track visited objects to avoid infinite recursion
  const seen = new WeakSet();
  const processObject = (obj) => {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj)) {
      return null; // prevent infinite loop on circular reference
    }
    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map((item) => processObject(item));
    }

    const processed = {};
    for (const [key, value] of Object.entries(obj)) {
      // Handle Arabic fields
      if (key.endsWith("Ar") && isRTL) {
        const baseKey = key.slice(0, -2);
        processed[baseKey] = value;
      } else if (!key.endsWith("Ar")) {
        processed[key] = processObject(value);
      }
    }

    return processed;
  };

  return processObject(data);
};

// Middleware to format response data
const formatResponseMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (data && typeof data === "object") {
      // Format the response data based on language direction
      const formattedData = formatResponse(data, req);

      // Add language metadata to response
      if (formattedData.status === "success" && formattedData.data) {
        formattedData.language = {
          code: req.language,
          direction: req.direction,
          isRTL: req.isRTL,
        };
      }

      return originalJson.call(this, formattedData);
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  rtlSupport,
  formatResponse,
  formatResponseMiddleware,
};
