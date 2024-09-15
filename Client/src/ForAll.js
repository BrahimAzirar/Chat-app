const IsNotEmpty = (obj, message = null) => {
    const result1 = Object.values(obj).some(ele => ele === "");
    const result2 = Object.values(obj).every(ele => ele === "");
    if (result2) return message ? message : "all fields is empty";
    else if (result1) return  message ? message : "Some input fields is empty";
    return "";
};

export { IsNotEmpty };