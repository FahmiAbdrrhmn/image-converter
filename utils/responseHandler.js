// Format standar untuk respons sukses
const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message: message,
    };
    // Hanya tampilkan 'data' jika memang ada data yang dikirim
    if (data) response.data = data;
    
    return res.status(statusCode).json(response);
};

// Format standar untuk respons error
const errorResponse = (res, statusCode, message, errorDetails = null) => {
    const response = {
        success: false,
        message: message,
    };
    // Berguna untuk mode debugging (bisa disembunyikan di production nanti)
    if (errorDetails) response.error = errorDetails;

    return res.status(statusCode).json(response);
};

module.exports = { successResponse, errorResponse };