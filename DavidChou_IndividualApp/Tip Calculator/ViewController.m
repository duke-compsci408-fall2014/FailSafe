//
//  ViewController.m
//  Tip Calculator
//
//  Created by David Chou on 9/7/14.
//  Copyright (c) 2014 David Chou. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)signinClicked:(id)sender {
    [self performSegueWithIdentifier:@"login_success" sender:self];
    
}

- (IBAction)backgroundTap:(id)sender {
    [self.view endEditing:YES];
}

-(BOOL) textFieldShouldReturn:(UITextField *)textField {
    [textField resignFirstResponder];
    return YES;
}
@end
