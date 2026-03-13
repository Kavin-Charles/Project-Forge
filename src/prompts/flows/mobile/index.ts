import inquirer from 'inquirer';

/**
 * Dynamic prompt flow specifically for Mobile Applications.
 */
export async function runMobileFlow(): Promise<Record<string, any>> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'mobileFramework',
      message: 'Select a mobile framework:',
      choices: [
        { name: 'React Native (Expo)', value: 'react-native' },
        { name: 'Flutter', value: 'flutter' },
        { name: 'Swift (iOS Native)', value: 'swift' },
        { name: 'Kotlin (Android Native)', value: 'kotlin' },
      ],
    },
    {
      type: 'list',
      name: 'platformTarget',
      message: 'Select platform target:',
      choices: [
        { name: 'Cross-platform (iOS & Android)', value: 'cross-platform' },
        { name: 'iOS Only', value: 'ios' },
        { name: 'Android Only', value: 'android' },
      ],
      // Only ask for platform target if it's a cross-platform framework
      when: (answers) => ['react-native', 'flutter'].includes(answers.mobileFramework),
    },
    {
      type: 'confirm',
      name: 'backendIntegration',
      message: 'Do you need a backend API integration generated?',
      default: false,
    },
  ]);

  // Set default platform target for native frameworks
  if (answers.mobileFramework === 'swift') answers.platformTarget = 'ios';
  if (answers.mobileFramework === 'kotlin') answers.platformTarget = 'android';

  return answers;
}
