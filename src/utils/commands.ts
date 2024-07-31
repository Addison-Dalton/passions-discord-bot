export const letterGrade = (points: number) => {
  const grades = [
    { grade: "S+++", threshold: 100 },
    { grade: "A+", threshold: 97 },
    { grade: "A", threshold: 93 },
    { grade: "A-", threshold: 90 },
    { grade: "B+", threshold: 87 },
    { grade: "B", threshold: 83 },
    { grade: "B-", threshold: 80 },
    { grade: "C+", threshold: 77 },
    { grade: "C", threshold: 73 },
    { grade: "C-", threshold: 70 },
    { grade: "D+", threshold: 67 },
    { grade: "D", threshold: 63 },
    { grade: "D-", threshold: 60 },
    { grade: "F", threshold: 10 },
    { grade: "Z-", threshold: 0 },
  ];

  const grade = grades.find((g) => points >= g.threshold);
  return grade ? grade.grade : "F";
};