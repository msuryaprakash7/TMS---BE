const formatResponse = (
  code,
  status,
  message,
  description,
  data = null,
  pagination = {}
) => {
  return {
    timestamp: new Date().toISOString(),
    code,
    status,
    message,
    description,
    data,
    pagination,
  };
};

module.exports = formatResponse;
