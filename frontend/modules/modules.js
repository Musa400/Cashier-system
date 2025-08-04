import axios from 'axios'
//http request
export const http = (accessToken=null)=>{
    axios.defaults.baseURL = import.meta.env.VITE_BASEURL
    if(accessToken){
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    }
    return axios


}
//trim data
export const trimData = (obj)=>{
  let finalObj = {};
  for (let key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      finalObj[key] = value.trim().toLowerCase();
    } else if (typeof value === "number" || typeof value === "boolean") {
      finalObj[key] = value.toString();
    } else {
      finalObj[key] = value;
    }
  }
  return finalObj;
};

export const uploadFile = async(file,folderName) =>{
  const formData = new FormData();
  formData.append("file",file);
  formData.append("folderName",folderName);
  try{
    const httpReq = http();
    const response = await httpReq.post(
      `/api/upload?folderName=${folderName}`,
      formData
    );
    return response.data;

  } catch (error){
    throw error.response?.data || error
  }
}


   // fetcher
   export const fetchData = async (api)=>{
    try {
      const httpReq = http();
      const {data} = await httpReq.get(api)
      return data
    } catch (err) {
      return null
    }

   }

 // formate date
export const formatDate = (d) => {
    const date = new Date(d);
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();
    let tt = date.toLocaleTimeString();
    dd = dd < 10 ? "0" + dd : dd;
    mm = mm < 10 ? "0" + mm : mm;
    return `${dd}-${mm}-${yy} ${tt}`;
}