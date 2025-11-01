import axios from "axios";

export const aiOnImage = async(base64: string) => await axios.post('https://medicineschedulerai.onrender.com/generate/image', {
                imageBase64: base64,
              });
export const aiOnText = async(prescriptionData: string) => await axios.post('https://medicineschedulerai.onrender.com/generate/textinput', { data: prescriptionData });
             