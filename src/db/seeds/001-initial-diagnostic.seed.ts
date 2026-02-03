import { randomUUID } from 'crypto';

export const initialDiagnosticSeed = {
  id: randomUUID(),
  version: 'v1.0.0',
  language: 'en',
  questions: JSON.stringify([
    {
      id: 'M1',
      theme: 'Motivate',
      dimension: 'Governance',
      text: 'Are there national policies supporting landscape restoration?'
    },
    {
      id: 'M2',
      theme: 'Motivate',
      dimension: 'Governance',
      text: 'Is there political will to implement restoration policies?'
    },
    {
      id: 'M3',
      theme: 'Motivate',
      dimension: 'Gender',
      text: 'Are gender considerations integrated into restoration planning?'
    },
    {
      id: 'M4',
      theme: 'Motivate',
      dimension: 'Gender',
      text: 'Do women have equal participation in restoration decision-making?'
    },
    {
      id: 'M5',
      theme: 'Motivate',
      dimension: 'Finance',
      text: 'Is there sustainable financing for restoration activities?'
    },
    {
      id: 'M6',
      theme: 'Motivate',
      dimension: 'Finance',
      text: 'Are private sector actors engaged in restoration financing?'
    },
    {
      id: 'M7',
      theme: 'Motivate',
      dimension: 'Governance',
      text: 'Are institutional frameworks adequate for restoration?'
    },
    {
      id: 'M8',
      theme: 'Motivate',
      dimension: 'Finance',
      text: 'Is there clarity on financial mechanisms for restoration?'
    },
    {
      id: 'E1',
      theme: 'Enable',
      dimension: 'Governance',
      text: 'Are land tenure rights clearly defined and secure?'
    },
    {
      id: 'E2',
      theme: 'Enable',
      dimension: 'Governance',
      text: 'Do local communities have rights to manage restoration areas?'
    },
    {
      id: 'E3',
      theme: 'Enable',
      dimension: 'Gender',
      text: 'Are women included in capacity building for restoration?'
    },
    {
      id: 'E4',
      theme: 'Enable',
      dimension: 'Gender',
      text: 'Is gender-sensitive data available for restoration planning?'
    },
    {
      id: 'E5',
      theme: 'Enable',
      dimension: 'Finance',
      text: 'Are financial incentives available for restoration implementers?'
    },
    {
      id: 'E6',
      theme: 'Enable',
      dimension: 'Finance',
      text: 'Is there access to technical assistance for project financing?'
    },
    {
      id: 'E7',
      theme: 'Enable',
      dimension: 'Governance',
      text: 'Are monitoring and evaluation systems in place?'
    },
    {
      id: 'E8',
      theme: 'Enable',
      dimension: 'Governance',
      text: 'Is there coordination among government agencies?'
    },
    {
      id: 'I1',
      theme: 'Implement',
      dimension: 'Governance',
      text: 'Are restoration projects being implemented on the ground?'
    },
    {
      id: 'I2',
      theme: 'Implement',
      dimension: 'Governance',
      text: 'Is there community engagement in implementation?'
    },
    {
      id: 'I3',
      theme: 'Implement',
      dimension: 'Gender',
      text: 'Are women actively participating in restoration activities?'
    },
    {
      id: 'I4',
      theme: 'Implement',
      dimension: 'Gender',
      text: 'Do restoration activities create employment for women?'
    },
    {
      id: 'I5',
      theme: 'Implement',
      dimension: 'Finance',
      text: 'Are funds being disbursed effectively for implementation?'
    },
    {
      id: 'I6',
      theme: 'Implement',
      dimension: 'Finance',
      text: 'Is there financial sustainability for long-term maintenance?'
    },
    {
      id: 'I7',
      theme: 'Implement',
      dimension: 'Governance',
      text: 'Are results being documented and shared?'
    },
    {
      id: 'I8',
      theme: 'Implement',
      dimension: 'Governance',
      text: 'Is adaptive management being practiced?'
    }
  ]),
  creation_date: new Date()
};
