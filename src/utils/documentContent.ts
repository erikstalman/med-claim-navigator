
export const generateDocumentContent = (fileName: string, fileType: string): string => {
  const baseName = fileName.toLowerCase();
  
  if (baseName.includes('medical') || baseName.includes('report')) {
    return `MEDICAL REPORT\n\nPatient: John Smith\nDate: ${new Date().toLocaleDateString()}\n\nChief Complaint: Lower back pain following motor vehicle accident\n\nHistory of Present Illness:\nPatient reports acute onset of lower back pain immediately following motor vehicle collision on ${new Date().toLocaleDateString()}. Pain is described as sharp and radiating down the left leg. Patient denies numbness or tingling.\n\nPhysical Examination:\n- Tenderness over L4-L5 region\n- Limited range of motion\n- Positive straight leg raise test\n\nAssessment:\nAcute lumbar strain secondary to motor vehicle accident\n\nPlan:\n- Physical therapy\n- Pain management\n- Follow-up in 2 weeks\n\nDr. Sarah Johnson, MD\nOrthopedic Specialist`;
  }
  
  if (baseName.includes('xray') || baseName.includes('imaging') || baseName.includes('scan')) {
    return `RADIOLOGY REPORT\n\nExamination: Lumbar spine X-ray\nDate: ${new Date().toLocaleDateString()}\n\nClinical History:\nLower back pain following motor vehicle accident\n\nFindings:\n- No acute fractures identified\n- Mild disc space narrowing at L4-L5\n- Soft tissue swelling noted\n- No evidence of instability\n\nImpression:\nNo acute osseous injury. Mild degenerative changes at L4-L5.\n\nRecommendations:\nMRI may be considered if symptoms persist.\n\nDr. Michael Chen, MD\nRadiologist`;
  }
  
  if (baseName.includes('police') || baseName.includes('accident')) {
    return `POLICE ACCIDENT REPORT\n\nReport Number: PA${Date.now()}\nDate: ${new Date().toLocaleDateString()}\nTime: 14:30\n\nLocation: Main St & Oak Ave intersection\n\nVehicles Involved:\nVehicle 1: 2020 Honda Civic (Driver: John Smith)\nVehicle 2: 2018 Ford F-150 (Driver: Jane Doe)\n\nNarrative:\nVehicle 2 ran red light and struck Vehicle 1 in the driver's side. Impact occurred at approximately 45 mph. Vehicle 1 sustained major damage to driver's side. Driver of Vehicle 1 complained of back pain and was transported to hospital.\n\nCitations Issued:\nVehicle 2 driver cited for running red light\n\nOfficer: Badge #1234\nSgt. Robert Johnson`;
  }
  
  return `Document Content for: ${fileName}\n\nThis document contains important information related to the case.\n\nUploaded on: ${new Date().toLocaleString()}\nFile type: ${fileType}\n\nContent would be extracted here based on the actual file content.`;
};

export const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // For demo purposes, create realistic document content based on file type
      const content = generateDocumentContent(file.name, file.type);
      resolve(content);
    };
    reader.readAsText(file);
  });
};
